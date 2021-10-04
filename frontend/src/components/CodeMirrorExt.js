import React, { Component } from "react";

import { Controlled as CodeMirror } from '@leifandersen/react-codemirror2'

require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');

require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/javascript-lint');


require('codemirror/lib/codemirror.css');
require('codemirror/addon/lint/lint.css');
window.JSHINT = require('jshint').JSHINT;
export default class CodeMirrorExt extends Component {

    render() {

        let props = { ...this.props };

        delete props.onChange;

        const onChange = this.props.onChange;
        return (

            <div style={props.style}>
                <CodeMirror {...props} onBeforeChange={(editor, data, value) => {
                    if(onChange) onChange(value)
                }} />
            </div>
        )
    }
}