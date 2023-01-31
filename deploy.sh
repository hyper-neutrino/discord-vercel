eval $(cat .env)
curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bot $TOKEN" \
    -d '{"name":"greet","description":"greet someone","options":[{"name":"name","description":"the person''s name","type":3,"required":true}]}' \
    https://discord.com/api/v10/applications/$CLIENT_ID/commands