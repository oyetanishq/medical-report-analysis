import json
import boto3
import base64

# Initialize the Textract client
textract_client = boto3.client('textract')

"""
    Receives a PDF file via API Gateway, processes it with Textract,
    and returns formatted tables and form data.
"""
def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")

    # Handle preflight
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",   # or specific domain
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            "body": ""
        }
    
    try:
        # only allow binary file content
        if not event.get('isBase64Encoded'):
            raise ValueError("File content is not Base64 encoded.")
            
        pdf_bytes = base64.b64decode(event['body'])

        # Call Textract with TABLES and FORMS features
        response = textract_client.analyze_document(
            Document={'Bytes': pdf_bytes},
            FeatureTypes=['TABLES', 'FORMS']
        )

        # Parse the raw JSON response into clean Markdown
        markdown_output = parse_textract_response(response)

        return {
            'statusCode': 200,
            'headers': {
                # CORS headers to allow requests from any origin (e.g., a local HTML file)
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Content-Type': 'text/plain'
            },
            'body': markdown_output
        }

    except Exception as e:
        print(f"Error: {e}")

        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
            },
            'body': json.dumps({'error': str(e)})
        }

def parse_textract_response(response):
    """
    Parses Textract's JSON output and formats it into a readable Markdown string.
    """
    blocks = response['Blocks']
    block_map = {block['Id']: block for block in blocks}
    markdown_lines = ["# Document Analysis\n"]

    # Extract Form Data (Key-Value Pairs)
    key_value_blocks = [b for b in blocks if b['BlockType'] == 'KEY_VALUE_SET' and 'KEY' in b['EntityTypes']]
    if key_value_blocks:
        markdown_lines.append("## Form Data\n")
        for key_block in key_value_blocks:
            key_text = get_text_from_relationships(key_block, block_map)
            value_text = get_value_text(key_block, block_map)
            markdown_lines.append(f"- **{key_text}:** {value_text}")
        markdown_lines.append("\n")

    # Extract Tables
    table_blocks = [b for b in blocks if b['BlockType'] == 'TABLE']
    if table_blocks:
        markdown_lines.append("## Tables\n")
        for i, table in enumerate(table_blocks):
            markdown_lines.append(f"### Table {i + 1}\n")
            table_data = reconstruct_table(table, block_map)
            if not table_data or not table_data[0]: continue
            
            header = "| " + " | ".join(table_data[0]) + " |"
            separator = "| " + " | ".join(["---"] * len(table_data[0])) + " |"
            markdown_lines.append(header)
            markdown_lines.append(separator)
            
            for row in table_data[1:]:
                markdown_lines.append("| " + " | ".join(row) + " |")
            markdown_lines.append("\n")
            
    return "\n".join(markdown_lines)

def get_value_text(key_block, block_map):
    """Finds the value text associated with a key block."""
    value_text = ""
    for rel in key_block.get('Relationships', []):
        if rel['Type'] == 'VALUE':
            for value_id in rel['Ids']:
                value_block = block_map.get(value_id)
                value_text += get_text_from_relationships(value_block, block_map) + " "
    return value_text.strip()

def get_text_from_relationships(block, block_map):
    """Extracts text from a block's child WORD blocks."""
    text = ""
    for rel in block.get('Relationships', []):
        if rel['Type'] == 'CHILD':
            for child_id in rel['Ids']:
                child = block_map.get(child_id)
                if child and child['BlockType'] == 'WORD':
                    text += child['Text'] + ' '
    return text.strip()

def reconstruct_table(table_block, block_map):
    """Rebuilds a table from Textract cell blocks."""
    rows = {}
    for rel in table_block['Relationships']:
        if rel['Type'] == 'CHILD':
            for cell_id in rel['Ids']:
                cell = block_map.get(cell_id)
                if not cell: continue
                row_idx, col_idx = cell['RowIndex'], cell['ColumnIndex']
                if row_idx not in rows:
                    rows[row_idx] = {}
                rows[row_idx][col_idx] = get_text_from_relationships(cell, block_map)
    if not rows: return []
    max_cols = max(max(r.keys()) for r in rows.values()) if rows else 0
    table = [["" for _ in range(max_cols)] for _ in range(max(rows.keys()))]
    for r_idx, r_data in rows.items():
        for c_idx, c_text in r_data.items():
            table[r_idx - 1][c_idx - 1] = c_text
    return table