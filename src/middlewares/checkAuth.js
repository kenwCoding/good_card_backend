import fetch from "cross-fetch";
import { invalidUserInfo } from "../utils/constants";

async function checkAuth (req, res, next) {
    try {
        const { cookies, headers } = req

        if (!headers || !cookies) {
            console.log('Missing headers or cookies');
            return res.status(403).json({ message: 'Missing headers' })
        }

        const { authorization } = headers

        if (!authorization) {
            console.log('Missing authorization headers');
        }

        // Get access token from auth header (Bearer xxxxx)
        const accessToken = authorization.split(' ')[1]

        // Get refresh token from cookies
        const refreshToken = cookies?.refreshToken

        // Error Handling for missing tokens
        if (!refreshToken) {
            return res.status(403).json({ message: 'Missing Refresh Token, Please login again.', userInfo: invalidUserInfo})
        }

        // Auth Check with Access Token
        const authCheckResult = await fetch(`${process.env.AUTH_SERVER_BASE_URL}/auth/check`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accessToken }),
            withCredntials: true,
            credentials: 'include'
        })

        // UnAuthorised => Refresh Access Token
        if (authCheckResult.status === 403) {
            // Refresh Tokens from auth backend by refresh token
            const refreshResult = await fetch(`${process.env.AUTH_SERVER_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken }),
                withCredntials: true,
                credentials: 'include'
            })

            // Error handling for invalid refresh token
            if (refreshResult.status === 403) {
                const { message } = await refreshResult.json()
                console.log('UnAuthorised: ', message);
                return res.status(403).json({ message, userInfo: invalidUserInfo }) 
            }

            // Retrive access token and userInfo
            const { accessToken, userInfo } = await refreshResult.json()

            console.log('Refreshed Access Token');

            req['accessToken'] = accessToken
            req['userInfo'] = userInfo
        
            next()
        } else if (authCheckResult.status != 200 ) {
            const { message } = await authCheckResult.json()
            console.log('Cehck Auth Error: ', message);
            return res.status(400).json({ message, userInfo: invalidUserInfo })
        }

        const { userInfo } = await authCheckResult.json()
        req['accessToken'] = accessToken
        req['userInfo'] = userInfo
    
        next()
    } catch (e) {
        console.error(e.message);
        return res.status(400).json({message: e, userInfo: invalidUserInfo})
    }
}

export { checkAuth }