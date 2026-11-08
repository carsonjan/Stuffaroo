pnpm dev 2>&1 /dev/null &
VITE_MARKETPLACE_URL=http://localhost:3000/marketplace pnpm --dir apps/homepage dev 2>&1 /dev/null &
echo "Go to http://localhost:3000/ to view the homepage"