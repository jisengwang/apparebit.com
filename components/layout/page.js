/* © 2020 Robert Grimm */

import Footer from './footer.js';

export default function PageProvider(file, context) {
  return `${file.content}\n${Footer(file, context)}\n\n</body></html>`;
}
