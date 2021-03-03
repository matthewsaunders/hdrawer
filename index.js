class HDrawer {
  constructor(el, options = {}) {
    this.drawers = [];
    this.el = el;

    this.el.class = 'hdrawer-container';
    this.el.style.display = 'flex';
    this.el.style.flexDirection = 'row';
    this.el.style.height = '100%';
    this.el.style.overflowX = 'scroll';

    // Exit early if no options are present
    if (options && Object.keys(options).length === 0) { return; }

    if (options["drawers"] && options["drawers"].length > 0) {
      for(const drawerOptions of options["drawers"]) {
        this.addDrawer(drawerOptions);
      }
    }
  }

  addDrawer(options = {}) {
    // 1. create a new drawer object
    let previousDrawer = null;

    if (this.drawers.length > 0) {
      previousDrawer = this.drawers[this.drawers.length - 1];
    }

    const drawerOptions = Object.assign(
      {
        hdrawer: this,
        previous: previousDrawer,
        animate: false,
      },
      options,
    );
    const currentDrawer = new Drawer(drawerOptions);

    // 2. remove unused drawers
    const previousIndex = this.drawers.findIndex((drawer) => drawer === currentDrawer.previousDrawer());

    for (let i = previousIndex + 1; i < this.drawers.length; ++i) {
      this.el.removeChild(this.drawers[i].content());
    }

    this.drawers.length = previousIndex + 1;

    // 3. add new drawer
    this.drawers.push(currentDrawer);
    this.el.appendChild(currentDrawer.content());
  }

  updateHtml() {
  }
}

class Drawer {
  constructor({ hdrawer, previous, html, url, animate } = options) {
    this.hdrawer = hdrawer;
    this.previous = previous;
    this.html = html || 'loading...';
    this.url = url;
    this.width = 400;

    this.drawerDiv = document.createElement('div');
    this.drawerDiv.innerHTML = this.html;
    this.drawerDiv.class = 'hdrawer-drawer';
    this.drawerDiv.style.minWidth = `${this.width}px`;
    this.drawerDiv.style.height = '100%';
    this.drawerDiv.style.border = '1px solid blue';

    if (animate) {
      this.drawerDiv.style.transition = 'all .25s ease';
      // setup animation here
    }

    // If a url is given, always try to set the drawer html using the url.
    if (this.url) {
      fetch(this.url)
        .then(response => response.text())
        .then(html => {
          let parser = new DOMParser();
          let doc = parser.parseFromString(html, "text/html");
          let body = doc.querySelector('body');
          this.drawerDiv.innerHTML = body.innerHTML;

          // Only set click event handlers for links explicitely tagged for hdrawer
          let links = this.drawerDiv.querySelectorAll('a[data-hdrawer-link]');

          for (const link of links) {
            link.addEventListener('click', (event) => {
              // stop link from naviagting to url
              event.preventDefault();
              event.stopPropagation();

              this.hdrawer.addDrawer({ url: link.href, previous: this, animate: true });
            });
          };
        });
    }
  }

  previousDrawer() {
    return this.previous;
  }

  content() {
    return this.drawerDiv;
  }
}

HDrawer.HDrawer = HDrawer;

if (typeof window !== 'undefined') {
  window.HDrawer = HDrawer;
}

export default HDrawer;
