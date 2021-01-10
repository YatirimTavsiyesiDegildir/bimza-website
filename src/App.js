import axios from 'axios';

// FILE POND START
// Import React FilePond
import { FilePond} from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// FILE POND END

import React, { Component, useState } from 'react';
import './App.css';
import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

const NodeRSA = require('node-rsa');

// Our app
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Set initial files, type 'local' means this is a file
            // that has already been uploaded to the server (see docs)
            file: [],
            keyFile: [],
            rsaKey: "",
            fileBase64: "",
            signature: ""
        };
    }

    // SIGNING
    FilepondServerFile = {process: (fieldName, file, metadata, load, error, progress, abort) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function (e) {
                this.setState({fileBase64: reader.result});
                load("");
                return;
            }.bind(this);
    }};

    FilepondServerKey = {process: (fieldName, file, metadata, load, error, progress, abort) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = function (e) {
                this.setState({rsaKey: reader.result});
                load("");
                return;
            }.bind(this);
    }};

    handleInit() {
        console.log("FilePond instance has initialised", this.filePond);
    }

    handleInitKey() {
        console.log("FilePond instance has initialised", this.pond);
    }

    signFile() {
        let key = new NodeRSA(this.state.rsaKey);
        let signature = key.sign(this.state.fileBase64, 'base64', 'utf8');
        this.setState({
            signature: signature
        });
        Auth.currentAuthenticatedUser()
            .then(user => {
                let blockData = {
                    owner: user.username,
                    file: this.state.fileBase64,
                    signature: signature
                };
                var xhr = new XMLHttpRequest();
                xhr.open("POST", 'http://api.bimza.online:3001/addBlock', true);

                //Send the proper header information along with the request
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

                xhr.onreadystatechange = function() { // Call a function when the state changes.
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                        console.log('Successful.');
                    }
                };
                xhr.send(JSON.stringify({data: blockData}));
            })
            .catch(err => console.log(err));
    }


    render() {
        return (
            <div className="App">
                <h2>Lutfen imzalamak istediginiz dosayai asagiya yukleyiniz.</h2>
                <FilePond
                    ref={ref => (this.filePond = ref)}
                    files={this.state.file}
                    allowMultiple={false}
                    server = {this.FilepondServerFile}
                    name="files"
                    oninit={() => this.handleInit()}
                    onupdatefiles={fileItems => {
                        // Set currently active file objects to this.state
                        this.setState({
                            file: fileItems.map(fileItem => fileItem.file)
                        });
                    }}
                />
                <h2>Lutfen e-imzanizi asagiya yukleyiniz.</h2>
                <FilePond
                    ref={ref => (this.pond = ref)}
                    files={this.state.keyFile}
                    allowMultiple={false}
                    server = {this.FilepondServerKey}
                    name="key_files"
                    oninit={() => this.handleInitKey()}
                    onupdatefiles={fileItems => {
                        // Set currently active file objects to this.state
                        this.setState({
                            keyFile: fileItems.map(fileItem => fileItem.file)
                        });
                    }}
                    //instantUpload={false}
                    allowFileEncode={true}
                />
                <button onClick={()=>this.signFile()}><label>Imzala</label></button>
                <button><label>Blockchain'i Gor</label></button>
                <label>info@bimza.online</label>
            </div>
        );
    }
}

export default withAuthenticator(App, true);
