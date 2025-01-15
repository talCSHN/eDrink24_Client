export function getAuthToken() {
    const token = localStorage.getItem('jwtAuthToken');
    return token;
}

export function tokenLoader() {
    return getAuthToken();
}
