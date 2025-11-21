export function jsonResponse(data, status = 200) {
  const headers = {
    'Content-Type': 'application/json',
    // Allow requests from any origin for development. 
    // For production, you might want to restrict this to your frontend's domain.
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // For OPTIONS requests (pre-flight checks from browsers), 
  // just return the headers with a 204 No Content status.
  if (data === null && status === 204) {
    return new Response(null, { status: 204, headers });
  }

  return new Response(JSON.stringify(data), { status, headers });
}