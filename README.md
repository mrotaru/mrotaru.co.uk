# mrotaru.co.uk

WIP:
- use plain html/js/css - the website is simple and no frameworks are needed
- remove Jest - it's way too complex; use someting like `tape`
- `lite-server` for automatic refresh

## Blog Posts, Pages
- content in a different, private repo to avoid lost SEO value
- folder per page/blog post: content.markdown, images, meta.json (title, url, keywords)
- generate content.html as part of content build/deploy
- content deployed separately
- use pushState, service worker to fetch content dynamically on click
- generate a complete page, to ensure it works without JS or SW support