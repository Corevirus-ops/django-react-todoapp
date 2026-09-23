const headers = {'Content-Type': 'application/json'}
const API_URL = 'http://localhost:8000/'

async function getApi(endpoint, method = 'GET', body = null) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: method,
       headers,
        body: body ? JSON.stringify(body) : null
    });
    return await response.json();
  }
  catch (error) {
    return console.error('Error during api call:', error);
  }
}

async function postApi(endpoint, method = 'POST', body = null) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        return await response.json();
    } catch (error) {
        return console.error('Error during api call:', error);
    }
}

async function deleteApi(endpoint, method = 'DELETE', body = null) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        return await response.json();
    }
    catch (error) {
        return console.error('Error during api call:', error);
    }
}

async function putApi(endpoint, method = 'PUT', body = null) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        return await response.json();
    }
    catch (error) {
        console.error('Error during api call:', error);
    }
}





export {getApi, postApi, deleteApi, putApi}