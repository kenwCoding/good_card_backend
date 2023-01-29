import fetch from "cross-fetch";

async function checkAuth (req, res, next) {
    try {
        const authorizationHeader = req.get('authorization')

        if (!authorizationHeader) {
            throw new Error('Missing authorization header')
        }

        const accessToken = authorizationHeader.split(' ')[1]

        if (!accessToken) {
            throw new Error('Missing Access Token')
        }

        const result = await fetch(`${process.env.AUTH_SERVER_BASE_URL}/auth/check`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accessToken: accessToken
            }) 
        })

        if (result.status != 200) {
            throw new Error('Token UnAuthorised')
        }

        const checkResult = await result.json()

        next()
    } catch (e) {
        console.error(e);
        return res.status(400).json({message: e.message})
    }
}

export { checkAuth }