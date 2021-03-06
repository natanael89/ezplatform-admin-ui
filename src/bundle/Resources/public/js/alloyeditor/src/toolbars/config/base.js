import ReactDOM from 'react-dom';

export default class EzConfigBase {
    static outlineTotalWidth(block) {
        let outlineOffset = parseInt(block.getComputedStyle('outline-offset'), 10);
        const outlineWidth = parseInt(block.getComputedStyle('outline-width'), 10);

        if (isNaN(outlineOffset)) {
            // Edge does not support offset-offset yet
            // 1 comes from the stylesheet, see theme/alloyeditor/content.css
            outlineOffset = 1;
        }
        return outlineOffset + outlineWidth;
    }

    static isEmpty(block) {
        const count = block.$.childNodes.length;

        return (count === 0 || (count === 1 && block.$.childNodes.item(0).localName === 'br'));
    }

    static setPositionFor(block, editor) {
        const blockRect = block.getClientRect();
        const outlineWidth = EzConfigBase.outlineTotalWidth(block);
        const empty = EzConfigBase.isEmpty(block);
        let positionReference = block;
        let left = 0;

        if (editor.widgets.getByElement(block)) {
            left = blockRect.left;
        } else {
            if (empty) {
                block.appendHtml('<span>&nbsp;</span>');
                positionReference = block.findOne('span');
            }

            const range = document.createRange();
            range.selectNodeContents(positionReference.$);
            left = range.getBoundingClientRect().left;

            if (empty) {
                positionReference.remove();
            }
        }

        const xy = this.getWidgetXYPoint(
            blockRect.left - outlineWidth,
            blockRect.top + block.getWindow().getScrollPosition().y - outlineWidth,
            CKEDITOR.SELECTION_BOTTOM_TO_TOP
        );

        const domElement = new CKEDITOR.dom.element(ReactDOM.findDOMNode(this));
        domElement.addClass('ae-toolbar-transition');
        domElement.setStyles({
            left: (left - outlineWidth) + 'px',
            top: xy[1] + 'px'
        });

        return true;
    }

    getStyles() {
        return {
            name: 'styles',
            cfg: {
                showRemoveStylesItem: false,
                styles: [
                    {name: 'Heading 1', style: {element: 'h1'}},
                    {name: 'Heading 2', style: {element: 'h2'}},
                    {name: 'Heading 3', style: {element: 'h3'}},
                    {name: 'Heading 4', style: {element: 'h4'}},
                    {name: 'Heading 5', style: {element: 'h5'}},
                    {name: 'Heading 6', style: {element: 'h6'}},
                    {name: 'Paragraph', style: {element: 'p'}},
                ]
            }
        };
    }

    /**
     * Returns the arrow box classes for the toolbar. The toolbar is
     * always positioned above its related block and has a special class to
     * move its tail on the left.
     *
     * @method getArrowBoxClasses
     * @return {String}
     */
    getArrowBoxClasses() {
        return 'ae-arrow-box ae-arrow-box-bottom ez-ae-arrow-box-left';
    }

    /**
     * Sets the position of the toolbar. It overrides the default styles
     * toolbar positioning to position the toolbar just above its related
     * block element. The related block element is the block indicated in
     * CKEditor's path or the target of the editorEvent event.
     *
     * @method setPosition
     * @param {Object} payload
     * @param {AlloyEditor.Core} payload.editor
     * @param {Object} payload.selectionData
     * @param {Object} payload.editorEvent
     * @return {Boolean} true if the method was able to position the
     * toolbar
     */
    setPosition(payload) {
        const editor = payload.editor.get('nativeEditor');
        let block = editor.elementPath().block;

        if (!block) {
            block = new CKEDITOR.dom.element(payload.editorEvent.data.nativeEvent.target);
        }

        return EzConfigBase.setPositionFor.call(this, block, editor);
    }
}
