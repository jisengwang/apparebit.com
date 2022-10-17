pid=$(lsof -nP -i4TCP:8080 | grep LISTEN | cut -w -f 2)
if [ -n "$pid" ]; then
    echo 'killing running server'
    kill -9 $pid
fi

"../siteforge/cli/main.js" build develop
