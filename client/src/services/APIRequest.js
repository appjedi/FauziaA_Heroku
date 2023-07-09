//const urlLocal = 'http://localhost:3001/graphql';
const url = 'graphql';

const SERVER_API_TOKEN = "SERVER_API_TOKEN";
let token = sessionStorage.getItem(SERVER_API_TOKEN);;
function setToken(t) {
    token = t;
    console.log("setToken", t);
    sessionStorage.setItem(SERVER_API_TOKEN, t);
}
function getToken() {
    token = sessionStorage.getItem(SERVER_API_TOKEN);
    return token;
}
function getServerURL() { return url; }

export default class APIRequest {
    static setToken(t) {
        if ((t + "").length < 100) {
            console.log("Invalid token");
            return false;
        }
        token = t;
        console.log("APIRequest.setToken", t);
        sessionStorage.setItem(SERVER_API_TOKEN, t);
        return true;
    }
    static async logout() {
        console.log("LOGOUT:", SERVER_API_TOKEN);
        const q = "query {logout }";
        //console.log("getTodos.TOKEN:", q);
        const response = await APIRequest.server(q);
        const responseText = await response.text();
        console.log("responseText", responseText);

        sessionStorage.removeItem(SERVER_API_TOKEN);

        return responseText;
    }
    static async auth(username, password) {
        try {
            const query = `mutation{
                    authenticate(name:"${username}", password:"${password}")
                }`;
            const headers = {
                'Content-Type': 'application/json'
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    query: query,
                }),
            });
            const responseText = await response.text();
            console.log("responseText", responseText);
            const responseData = JSON.parse(responseText);
            const token = responseData.data.authenticate;
            //console.log("responseData.token", token)
            setToken(token);
            return { status: 1, token: token, message: "registered" };
        } catch (e) {
            return { status: -1, token: "", message: "Invalid login", error:e };
        }
    }
    static async register(username, lastname, firstname, password1, password2) {
        try {
            const query = `mutation{
                reg(lastName: "${lastname}",firstName: "${firstname}", email:"${username}", password1:"${password1}", password2:"${password2}")
            }`;

            console.log("Q:", query)
            const headers = {
                'Content-Type': 'application/json'
            }
            const response = await APIRequest.graphql(query);
                
            const responseText = await response.text();
            console.log("responseText", responseText);
        
            const responseData = JSON.parse(responseText);
            const token = responseData.data.reg;
            console.log("responseData.token", token);
            setToken(token)
            return { status: 1, token: token, message: "registered" };
        } catch (e) {
            return { status: -1, token: "", message: "failed registration", error:e };
        }
    }
    static async graphql(query, token=null) {
        token = sessionStorage.getItem(SERVER_API_TOKEN);
        const headers = token ?
            {
                'Content-Type': 'application/json',
                'x-access-token': `${token}`
            }
            :
            {
                'Content-Type': 'application/json'
            }

        //console.log("HEADERS:", headers);
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: query,
            }),
        });
        return response;
    }
    static async server(query) {
        token = sessionStorage.getItem(SERVER_API_TOKEN);
        const headers = token ?
            {
                'Content-Type': 'application/json',
                'x-access-token': `${token}`
            }
            :
            {
                'Content-Type': 'application/json'
            }

        console.log("HEADERS:", headers);
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: query,
            }),
        });
        return response;
    }
    static async donate(amount) {
        const q = `mutation{
                    donate(amount: ${amount})
                }`
        //console.log("Q:", q)
        const response = await APIRequest.server(q);

        const responseText = await response.text();
        console.log("responseText", responseText);
        const url = responseText.split("url:")[1].split('"}}')[0];
        const responseData = JSON.parse(responseText);
        return url;

    }
    static async getProfile() {
        const q = "query {profile }";

        //console.log("Q:", q)
        const response = await APIRequest.server(q);

        const responseText = await response.text();
        //console.log("responseText", responseText);
        const responseData = JSON.parse(responseText);
        //donations = JSON.parse(responseData.data)
        const profile = JSON.parse(responseData.data.profile);
        //console.log("responseData", profile)
        return profile;
    }
    static async getDonations() {
        const q = "query {donations }";
        //console.log("getTodos.TOKEN:", q);
        const response = await APIRequest.server(q, token);
        const responseText = await response.text();
        //console.log("responseText", responseText);
        const responseData = JSON.parse(responseText);
        const donations = JSON.parse(responseData.data.donations)
        //console.log("responseData", donations)
        return donations;
    }
}

