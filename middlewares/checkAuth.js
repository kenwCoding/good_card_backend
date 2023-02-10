import fetch from "cross-fetch";

async function checkAuth (req, res, next) {
    try {
        const { cookies } = req

        if (!cookies?.accessToken || !cookies?.refreshToken) {
            return res.status(403).json({ message: 'Missing Refresh Token or Access Token, Please login again.'})
        }

        const { accessToken, refreshToken } = cookies

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

            if (refreshResult.status === 403) {
                const { message } = await refreshResult.json()
                console.log('UnAuthorised: ', message);
                return res.status(403).json({ message }) 
            }

            const { accessToken } = await refreshResult.json()

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            })

            console.log('Refreshed Access Token');
        } else if (authCheckResult.status != 200 ) {
            const { message } = await authCheckResult.json()
            console.log('Cehck Auth Error: ', message);
            return res.status(400).json({ message })
        }

        next()
    } catch (e) {
        console.error(e.message);
        return res.status(400).json({message: e})
    }
}

export { checkAuth }