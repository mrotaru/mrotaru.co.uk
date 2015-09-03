Sessions in general, and sessions in express.

Note: this article assumes you have a rough idea of the meaning of these
words and acronyms: HTML, server, browser, JavaScript

## What are cookies and why do we need them ?

Say you have a website and you want to allow users to select between two
themes: "light" and "dark". You can easily create a two buttons, one for each
theme, and wire them up with JavaScript. So, when the user chooses a theme, we
load the corresponding stylesheets.

But then we have a problem - visitors will have to make that selection every
time they visit the website, or navigate to a different page. Clearly, we need
a way of remembering such user preferences.

The smart people that designed HTTP also thought about this problem, and came
up with the idea of cookies. The HTTP standard goes something like this:

When a web browser receives from the server something like
`set-cookies:theme=light`, it must remember that theme=light, for that
particular website. And, whenever the client visits `domain.com` again, send
all these values to the server.

... not exact wording bug gist: websites can store info on browsers

So web browser know about cookies; they also allow us to check them via
JavaScript. What this means is that after our JavaScript was loaded in the
user's browser, we can see if the user has a cookie named `theme`, and then
load the corresponding stylesheets - automatically, the user doesn't have to
lift a finger. If he doesn't then we can show a message, "Seems like you didn't
try out our awesome themes!"

You might think at this point, that this could be a security issue. If your web
page can see these cookies, can't every other page the user visits ? This is
where [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy)
comes in. Essentially, it means browsers will not allow different websites to
see each other's cookies.

## Why do we need sessions ?

- stealing cookies
