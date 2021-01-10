// FILE POND START
// Import React FilePond
import {FilePond} from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// FILE POND END

import React, {Component} from 'react';
import './App.css';
import {withAuthenticator} from 'aws-amplify-react'
import Amplify, {Auth} from 'aws-amplify';
import aws_exports from './aws-exports';

import {Link, BrowserRouter as Router} from 'react-router-dom';

Amplify.configure(aws_exports);

const NodeRSA = require('node-rsa');

const logoStyle = {
    width: 100,
    height: 100,
    marginTop: 20
};
const fileUpload = {
    alignSelf: 'center',
    justifySelf: 'center',
    width: '60%'
};
const container = {
    display: "flex",
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center"
};
const lineBreak = {
    height: 20,
};

const button = {
    backgroundColor: '#42A899',
    height: 60,
    width: 200
};

// Our app
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Set initial files, type 'local' means this is a file
            // that has already been uploaded to the server (see docs)
            file: [],
            keyFile: [],
            rsaKey: "-----BEGIN RSA PRIVATE KEY-----\n" +
                "MIIBPAIBAAJBANokx2+afSh9jZItHyWwth2/C7xRBn0nLNjymNX8L1dstvgIFsvu\n" +
                "C3oiC+RjbASePlMM143hVHebR9IHFlB+rJcCAwEAAQJBAJe+Bc0oVe+YhqYsJQJ+\n" +
                "zfAbOPqiEjV0zsmK163iYrwYZidztYd70gbu3mEE4PElrl1mrkufClz+v3V/oU+1\n" +
                "w+ECIQD8L0USU5tGgPiCI8eqMtYgzyzRVSq7JBerOab1lnoV7QIhAN1xqnu/f3ue\n" +
                "hdmJyGDRI1Yf6cCIBO93znmkk9eYCbwTAiEApg4yOzkWW7x85qTMysOiwAPrjQO5\n" +
                "mXTQqQzTZY9qYJkCIBddffKOsyHVCSR58EWe646T0XM6JuMpjgSxw9O0vBo3AiEA\n" +
                "zkNoh0TorG1ad44XNqWOxMoVenjREuWtVd1Iue3VFe4=\n" +
                "-----END RSA PRIVATE KEY-----",
            fileBase64: "",
            signature: "",
            result: ""
        };
    }

    // SIGNING
    FilepondServerFile = {
        process: (fieldName, file, metadata, load, error, progress, abort) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function (e) {
                this.setState({fileBase64: reader.result});
                load("");
                return;
            }.bind(this);
        }
    };

    FilepondServerKey = {
        process: (fieldName, file, metadata, load, error, progress, abort) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = function (e) {
                this.setState({rsaKey: reader.result});
                load("");
                return;
            }.bind(this);
        }
    };

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
                    file: this.state.file[0].name,
                    signature: signature
                };
                var xhr = new XMLHttpRequest();
                xhr.open("POST", 'https://zrteptf684.execute-api.us-east-1.amazonaws.com/api/put_block', true);

                //Send the proper header information along with the request
                xhr.setRequestHeader("Content-Type", "application/json");

                xhr.onreadystatechange = () => { // Call a function when the state changes.
                    this.setState({result: "Imza basarili. \"Blockchain'i Gor\" butonuna tiklayarak kontrol edebilirsiniz."})
                };
                xhr.send(JSON.stringify({data: blockData}));
            })
            .catch(err => console.log(err));
    }


    render() {
        return (
            <Router>
                <div className="App" style={container}>
                    <img src='logo.png' alt="logo" style={logoStyle}/>
                    <h3>Lutfen imzalamak istediginiz dosyayi asagiya yukleyiniz.</h3>
                    <div style={fileUpload}>
                        <FilePond
                            ref={ref => (this.filePond = ref)}
                            files={this.state.file}
                            allowMultiple={false}
                            server={this.FilepondServerFile}
                            name="files"
                            oninit={() => this.handleInit()}
                            onupdatefiles={fileItems => {
                                // Set currently active file objects to this.state
                                this.setState({
                                    file: fileItems.map(fileItem => fileItem.file)
                                });
                            }}
                            width={50}
                        />
                    </div>
                    <h3>Lutfen e-imzanizi asagiya yukleyiniz.</h3>
                    <label>.pem uzantili imza RSA private keyinizi yukleyebilirsiniz ya da bos birakarak mevcut imza ile
                        yukleyebilirsiniz
                        imza ile imzalayabilirsiniz.</label>
                    <div style={lineBreak}/>
                    <div style={fileUpload}>
                        <FilePond
                            ref={ref => (this.pond = ref)}
                            files={this.state.keyFile}
                            allowMultiple={false}
                            server={this.FilepondServerKey}
                            name="key_files"
                            oninit={() => this.handleInitKey()}
                            onupdatefiles={fileItems => {
                                // Set currently active file objects to this.state
                                this.setState({
                                    keyFile: fileItems.map(fileItem => fileItem.file)
                                });
                            }}
                        />
                    </div>
                    <div style={lineBreak}/>
                    <button onClick={() => this.signFile()} style={button}>
                        <h4>Imzala*</h4>
                    </button>
                    <label>{this.state.result}</label>
                    <div style={lineBreak}/>
                    <button style={button} onClick={() => window.location = 'http://api.bimza.online:3002/blocks'}>
                        <h4>Blockchain'i Gor</h4>
                    </button>
                    <div style={lineBreak}/>
                    <h3>Sorulariniz Icin:</h3>
                    <label>info@bimza.online</label>
                    <label>(*) Test amaclidir hicbir yasal gecerliligi yoktur</label>
                </div>

            </Router>);
    }
}

export default withAuthenticator(App, true);
