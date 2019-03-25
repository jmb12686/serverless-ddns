
const responseHeaders = {
    'Content-Type': 'text/plain'
}

/**
 * HTTP response templates
 */
const responses = {
    success: (data = {}, code = 200) => {
        return {
            'statusCode': code,
            'headers': responseHeaders,
            'body': data
        }
    },
    error: (error) => {
        return {
            'statusCode': 400,
            'headers': responseHeaders,
            'body': error.message
        }
    }
}

module.exports.responses = responses;