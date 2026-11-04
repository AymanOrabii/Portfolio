Footnote — Free Academic CV Website Template by uiCookies
https://uicookies.com/

Footnote is a calm, highly readable personal website and CV template for
researchers, PhD students and faculty, built on Bootstrap 5. It is shown for
a fictional freshwater ecologist and ships five pages: a home page with bio,
footnotes, research interests, news, selected publications and office hours;
a publications page with type filters, search, a per-year chart and Copy
BibTeX buttons; a research page with projects, a grant timeline and a field
site map; a teaching page with courses, syllabi, supervision and an
office-hours booking form; and a print-optimised CV with an A4 / US Letter
switch. Source Serif 4 text, Libre Franklin labels and an oxblood accent give
it the feel of a university press page. Everything is vanilla JavaScript with
no jQuery, every section is visible without JavaScript, and motion respects
prefers-reduced-motion.
Free for personal and commercial use. Attribution is optional but always welcome — https://uicookies.com/license/

WHAT'S INSIDE
  index.html            Home: bio, position, interests, news, selected papers, contact
  publications.html     Full publication list with filters, search and BibTeX
  research.html         Projects, funding table and timeline, field sites, data & code
  teaching.html         Courses, syllabi, supervision, office hours and booking form
  cv.html               Print-ready academic CV (Download as PDF via the print dialog)
  css/vendor/           Bootstrap 5.3.8 (minified, self-hosted)
  css/style.css         Template design layer (palette, type, components, print)
  js/vendor/            Bootstrap 5.3.8 bundle (includes Popper)
  js/main.js            Template behaviour — vanilla JavaScript, no jQuery
  img/                  Demo photographs (public domain, see CREDITS.txt)
  CREDITS.txt           Source and licence of every demo photograph

NOTES
  - Built on Bootstrap 5.3.8. No jQuery, no plugin dependencies.
  - Colours and fonts are CSS custom properties at the top of css/style.css.
  - Each publication is one <li class="pub"> with data attributes for type,
    year, volume, pages and so on. Filters, counts, the per-year chart and the
    generated BibTeX all read from that markup, so adding a paper means
    copying one entry. Wrap your own name in <strong class="au me">.
  - The funding timeline on research.html is drawn from the table below it;
    edit the table rows (data-start / data-end) and the chart follows.
  - cv.html prints to A4 or US Letter with site navigation hidden. Use the
    browser's "Save as PDF" destination in the print dialog.
  - The home page shows a monogram in place of a portrait; replace the
    .bookplate block with an <img> of your own photo.
  - Forms are front-end only: they validate in the browser and show a
    success message. Point them at your form or booking service to go live.
  - DOI, PDF and profile links point to example.com placeholders.
  - Replace the demo images in img/ with your own optimised photos.
