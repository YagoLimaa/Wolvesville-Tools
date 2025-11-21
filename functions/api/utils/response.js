export function getRequestConfig(apiKey) {
  return {
    method: 'GET',
    headers: {
      'Authorization': `Bot ${apiKey}`,
      'Accept': 'application/json'
    }
  };
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
