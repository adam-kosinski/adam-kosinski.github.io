#!/bin/bash

if [[ $# -ne 1 ]]; then
    echo "Please pass the HTML file as the first argument"
    exit 0
fi

echo "Starting NodeJS server"
node "${BASH_SOURCE%/*}/NodeJS/node_server.js" $1 &
node_pid=$!

# run ngrok server in the background, and don't print output because that messes with the terminal in weird ways
echo "Starting ngrok server"
ngrok http 8000 > /dev/null &
ngrok_pid=$!

# wait for the tunnel to start, 1 second is usually enough
sleep 1

# query local ngrok api to get the tunnel url, and show as qr code
url=$(curl -s 'http://localhost:4040/api/tunnels' | python3 -c 'import sys, json; print(json.load(sys.stdin)["tunnels"][0]["public_url"])')
echo $url
echo "Opening QR code"
python3 -c "import qrcode; qrcode.make('$url').show()"

# hang out in an infinite loop until user exits, kill node server and ngrok when that happens
trap "kill $ngrok_pid; kill $node_pid" EXIT
while :
do
    sleep 1
done