export function jsonResponse(data, status = 200) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (data === null && status === 204) {
    return new Response(null, { status: 204, headers });
  }

  return new Response(JSON.stringify(data), { status, headers });
}