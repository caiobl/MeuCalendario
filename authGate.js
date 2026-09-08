// Soft UX gate, not the real security boundary anymore - that's the database's
// RLS policies now. This just avoids showing the app's pages to someone who
// hasn't unlocked the site at all (viewer flag or a real admin session).
// Must load AFTER supabaseClient.js, since it needs the shared `db` client.
// Pages await `authReady` to find out whether the current visitor is admin.
const authReady = (async () => {
	const { data: { session } } = await db.auth.getSession();
	const isAdmin = !!session;
	const isViewer = localStorage.getItem('site-role') === 'viewer';
	if (!isAdmin && !isViewer) {
		window.location.replace('main.html');
		return { isAdmin: false };
	}
	return { isAdmin };
})();