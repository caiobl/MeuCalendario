// Blocks direct access to this page until a valid password has been entered on main.html.
// Not real security (the passwords live in plain JS) - just keeps random visitors out.
const siteRole = localStorage.getItem('site-role');
if (siteRole !== 'viewer' && siteRole !== 'admin') {
	window.location.replace('main.html');
}