ace.define("ace/theme/my_custom_theme", ["require", "exports", "module", "ace/lib/dom"], function(require, exports, module) {
    exports.isDark = true;
    exports.cssClass = "ace-my-custom-theme";
    exports.cssText = `
        .ace-my-custom-theme .ace_gutter {
            background: rgba(39, 39, 39, 0.1);
            color: #CCC;
        }
        .ace-my-custom-theme .ace_print-margin {
            width: 1px;
            background: #555;
        }
        .ace-my-custom-theme {
            background: rgba(39, 39, 39, 0.1);
            backdrop-filter: blur(60px);
            -webkit-backdrop-filter: blur(60px);
            box-shadow: 0 0 80px rgba(0, 0, 0, 0.3);
            color: #F8F8F2;
        }
        .ace-my-custom-theme .ace_cursor {
            color: #F8F8F0;
        }
        .ace-my-custom-theme .ace_marker-layer .ace_selection {
            background: rgba(179, 101, 57, 0.75);
        }
        .ace-my-custom-theme.ace_multiselect .ace_selection.ace_start {
            box-shadow: 0 0 3px 0px #272822;
            border-radius: 2px;
        }
        .ace-my-custom-theme .ace_marker-layer .ace_step {
            background: rgb(102, 82, 0);
        }
        .ace-my-custom-theme .ace_marker-layer .ace_bracket {
            margin: -1px 0 0 -1px;
        }
        .ace-my-custom-theme .ace_marker-layer .ace_active-line {
            background: rgba(255, 255, 255, 0.1);
        }
        .ace-my-custom-theme .ace_gutter-active-line {
            background-color: rgba(255, 255, 255, 0.1);
        }
        .ace-my-custom-theme .ace_marker-layer .ace_selected-word {
        }
        .ace-my-custom-theme .ace_invisible {
            color: rgba(255, 255, 255, 0.25);
        }
        .ace-my-custom-theme .ace_entity.ace_name.ace_tag,
        .ace-my-custom-theme .ace_keyword,
        .ace-my-custom-theme .ace_meta.ace_tag,
        .ace-my-custom-theme .ace_storage {
            color: #F92672;
        }
        .ace-my-custom-theme .ace_punctuation,
        .ace-my-custom-theme .ace_punctuation.ace_tag {
            color: #fff;
        }
        .ace-my-custom-theme .ace_constant.ace_character,
        .ace-my-custom-theme .ace_constant.ace_language,
        .ace-my-custom-theme .ace_constant.ace_numeric,
        .ace-my-custom-theme .ace_constant.ace_other {
            color: #AE81FF;
        }
        .ace-my-custom-theme .ace_invalid {
            color: #F8F8F0;
            background-color: #F92672;
        }
        .ace-my-custom-theme .ace_invalid.ace_deprecated {
            color: #F8F8F0;
            background-color: #AE81FF;
        }
        .ace-my-custom-theme .ace_support.ace_constant,
        .ace-my-custom-theme .ace_support.ace_function {
            color: #66D9EF;
        }
        .ace-my-custom-theme .ace_fold {
            background-color: #A6E22E;
        }
        .ace-my-custom-theme .ace_storage.ace_type,
        .ace-my-custom-theme .ace_support.ace_class,
        .ace-my-custom-theme .ace_support.ace_type {
            font-style: italic;
            color: #66D9EF;
        }
        .ace-my-custom-theme .ace_entity.ace_name.ace_function,
        .ace-my-custom-theme .ace_entity.ace_other,
        .ace-my-custom-theme .ace_entity.ace_other.ace_attribute-name,
        .ace-my-custom-theme .ace_variable {
            color: #A6E22E;
        }
        .ace-my-custom-theme .ace_variable.ace_parameter {
            font-style: italic;
            color: #FD971F;
        }
        .ace-my-custom-theme .ace_string {
            color: #E6DB74;
        }
        .ace-my-custom-theme .ace_comment {
            color: #75715E;
        }
        .ace-my-custom-theme .ace_indent-guide {
            background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/rcD5jMAAAAASUVORK5CYII=) right repeat-y;
        }
    `;
    var dom = require("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});
