// Blocks direct access to this page until the password has been entered on main.html.
// Not real security (the password lives in plain JS) - just keeps random visitors out.
if (localStorage.getItem('site-unlocked') !== 'true') {
	window.location.replace('main.html');
}
