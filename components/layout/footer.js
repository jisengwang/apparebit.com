/* © 2020-2021 Robert Grimm */

export default function Footer() {
  return `<footer class=page-footer role=contentinfo>
<div class=in-here>
<h2 id=in-here>In Here</h2>
<ul>
  <li><a rel="home" href="/">Home</a></li>
  <li><a href="/blog">Blog</a></li>
  <li><a href="/about/robert-grimm">Bio Sketch</a></li>
  <li><a href="/about/apparebit">Imprint</a></li>
  <li><a href="/about/privacy">Privacy</a></li>
</ul>
</div>

<div class=out-there>
<h2 id=out-there>Out There</h2>
<ul>
  <li><a rel="author noreferrer" href="https://www.facebook.com/apparebit">Facebook</a></li>
  <li><a rel=author href="https://github.com/apparebit">Github</a></li>
  <li><a rel="author noreferrer" href="https://www.instagram.com/apparebit/">Instagram</a></li>
  <li><a rel="author noreferrer" href="https://www.linkedin.com/in/apparebit/">LinkedIn</a></li>
  <li><a rel="author noreferrer" href="https://twitter.com/apparebit/">Twitter</a></li>
</ul>
</div>

<p class=copyright>© 2011–2021
<a rel="me author" href="mailto:apparebit@gmail.com">Robert Grimm</a>.
All rights reserved.</p>
</footer>`;
}
