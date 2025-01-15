// https://developers.kakaomobility.com/docs/navi-api/directions/ 

export async function getLoadDirection(startPoint, endPoint) {
    const REST_API_KEY = `${process.env.REACT_APP_REST_API_KEY}`;
    const url = 'https://apis-navi.kakaomobility.com/v1/directions';

    const origin = `${startPoint.lng},${startPoint.lat}`;
    const destination = `${endPoint.lng},${endPoint.lat}`;

    const headers = {
        Authorization: `KakaoAK ${REST_API_KEY}`,
        'Content-Type': 'application/json'
    };

    const queryParams = new URLSearchParams({
        origin: origin,
        destination: destination
    });

    const requestUrl = `${url}?${queryParams}`;

    try {
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error-Status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error);
    }
}


export function drawRoute(map, data) {
    if (!data) {
        console.error('Invalid Data :', data);
    }

    const linePath = [];

    data.routes[0].sections[0].roads.forEach(road => {
        road.vertexes.forEach((vertex, index) => {
            if (index % 2 === 0) {
                const lng = vertex;
                const lat = road.vertexes[index + 1];
                linePath.push(new window.kakao.maps.LatLng(lat, lng));
            }
        });
    });

    const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 3,
        strokeColor: '#FFB71B',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
    });

    polyline.setMap(map);
}
