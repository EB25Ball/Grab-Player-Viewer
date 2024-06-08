document.addEventListener('DOMContentLoaded', () => {
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/my_custom_theme"); // Set the custom theme
    editor.session.setMode("ace/mode/json");

    const tab1Button = document.getElementById('tab1');
    const tab2Button = document.getElementById('tab2');

    let tab1Data = null;
    let tab2Data = null;

    const loadJSON = async (url) => {
        const response = await fetch(url);
        const data = await response.json();
        return JSON.stringify(data, null, 2);
    };

    const switchToTab = async (tabNumber) => {
        if (tabNumber === 1) {
            if (!tab1Data) {
                const url = 'https://api.slin.dev/grab/v1/get_shop_items?version=2';
                tab1Data = await loadJSON(url);
            }
            tab1Button.classList.add('active');
            tab2Button.classList.remove('active');
            editor.session.setValue(tab1Data);
        } else if (tabNumber === 2) {
            if (!tab2Data) {
                const url = 'https://api.slin.dev/grab/v1/get_shop_products?version=2';
                tab2Data = await loadJSON(url);
            }
            tab1Button.classList.remove('active');
            tab2Button.classList.add('active');
            editor.session.setValue(tab2Data);
        }
    };

    tab1Button.addEventListener('click', () => switchToTab(1));
    tab2Button.addEventListener('click', () => switchToTab(2));

    switchToTab(1);

    const resizer = document.getElementById('resizer');
    const editorContainer = document.querySelector('.editor-container');
    const container = document.querySelector('.container');

    resizer.addEventListener('mousedown', function (e) {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        const containerRect = container.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        if (newWidth > 200 && newWidth < containerRect.width - 200) {
            editorContainer.style.flex = `0 0 ${(containerRect.right - e.clientX)}px`;
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
});
