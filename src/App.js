// FILE POND START
// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
// FILE POND END

import React, { Component, useState } from 'react';
import './App.css';
import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

const FilepondServerFile = {process: (fieldName, file, metadata, load, error, progress, abort) => {
        console.log("File uploaded");
}};
const FilepondServerKey = {process: (fieldName, file, metadata, load, error, progress, abort) => {
        console.log("Key uploaded");
    }};

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

// Our app
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Set initial files, type 'local' means this is a file
            // that has already been uploaded to the server (see docs)
            file: [],
            keyFile: [],
        };

    }

    handleInit() {
        console.log("FilePond instance has initialised", this.pond);
    }


    render() {
        return (
            <div className="App">
                <label>Lutfen imzalamak istediginiz dosayai asagiya yukleyiniz.</label>
                <FilePond
                    ref={ref => (this.pond = ref)}
                    files={this.state.file}
                    allowMultiple={false}
                    server = {FilepondServerFile}
                    name="files"
                    oninit={() => this.handleInit()}
                    onupdatefiles={fileItems => {
                        // Set currently active file objects to this.state
                        this.setState({
                            file: fileItems.map(fileItem => fileItem.file)
                        });
                    }}
                    instantUpload={false}
                />
                <label>Lutfen e-imzanizi asagiya yukleyiniz.</label>
                <FilePond
                    ref={ref => (this.pond = ref)}
                    files={this.state.keyFile}
                    allowMultiple={false}
                    server = {FilepondServerKey}
                    name="key_files"
                    oninit={() => this.handleInit()}
                    onupdatefiles={fileItems => {
                        // Set currently active file objects to this.state
                        this.setState({
                            keyFile: fileItems.map(fileItem => fileItem.file)
                        });
                    }}
                    instantUpload={false}
                />
                <button><label>Imzala</label></button>
            </div>
        );
    }
}

export default withAuthenticator(App, true);
