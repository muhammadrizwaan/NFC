import React, { Component } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TextInput,
    Alert,
    Platform,
    TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            log: "Ready...",
            text: "",
            ProductDeals: [],
            Device: 'IOS',
            Message: 'Registerd tag',
            Value: ''
        }
    }
    async componentDidMount() {
        NfcManager.start();
    }
    componentWillUnMount() {
        this.cleanUp();
    }
    cleanUp = () => {
        NfcManager.cancelTechnologyRequest().catch(() => 0);
    }
    onChangeText = (text) => {
        this.setState({
            text
        })
    }
    writeData = async () => {
        if (!this.state.text) {
            Alert.alert("Enter some text");
            return;
        }
        try {
            let tech = Platform.OS === 'ios' ? NfcTech.MifareIOS : NfcTech.NfcA;
            let resp = await NfcManager.requestTechnology(tech, {
                alertMessage: "Ready for magic"
            });
            let cmd = Platform.OS === 'ios' ? NfcManager.sendMifareCommandIOS : NfcManager.transceive;
            let text = this.state.text;
            let fullLength = text.length + 7;
            let payloadLength = text.length + 3;
            resp = await cmd([0xA2, 0x04, 0x03, fullLength, 0xD1, 0x01]);
            resp = await cmd([0xA2, 0x05, payloadLength, 0x54, 0x02, 0x65]) // T enYourPayload
            let currentPage = 6;
            let currentPayload = [0xA2, currentPage, 0x6E]; // n
            for (let i = 0; i < text.length; i++) {
                currentPayload.push(text.charCodeAt(i));
                if (currentPayload.length == 6) {
                    resp = await cmd(currentPayload);
                    currentPage += 1;
                    currentPayload = [0xA2, currentPage]
                }
            }
            currentPayload.push(254);
            console.log('currrrrrrr', currentPayload);
            while (currentPayload.length < 6) {
                currentPayload.push(0);
            }
            resp = await cmd(currentPayload);
            this.setState({
                log: resp.toString() === "10" ? "Success" : resp.toString()
            })
            //sendMifareCommandIOS
        } catch (err) {
            this.setState({
                log: err.toString()
            })
            this.cleanUp();
        }
    }
    readData = async () => {
        try {
            let tech = Platform.OS === 'ios' ? NfcTech.MifareIOS : NfcTech.NfcA;
            let resp = await NfcManager.requestTechnology(tech, {
                alertMessage: "Ready for magic"
            });
            let cmd = Platform.OS === 'ios' ? NfcManager.sendMifareCommandIOS : NfcManager.transceive;
            resp = await cmd([0x3A, 4, 4])
            let payloadLength = parseInt(resp.toString().split(",")[1]);
            let payloadPages = Math.ceil(payloadLength / 4);
            let startPage = 5;
            let endPage = startPage + payloadPages - 1;
            resp = await cmd([0x3A, startPage, endPage]);
            let bytes = resp.toString().split(",");
            let text = ""
            for (let i = 0; i < bytes.length; i++) {
                if (i < 5) {
                    continue;
                }
                if (parseInt(bytes[i]) === 254) {
                    break;
                }
                text = text + String.fromCharCode(parseInt(bytes[i]));
            }
            this.setState({
                log: text
            })
        } catch (err) {
            this.setState({
                log: err.toString()
            })
            this.cleanUp();
        }
    }
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <TextInput
                    style={styles.textInput}
                    onChangeText={this.onChangeText}
                    autoCompleteType="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#888888"
                    placeholder="Enter text here" />
                <TouchableOpacity
                    onPress={this.writeData}
                    style={styles.buttonWrite}>
                    <Text style={styles.buttonText}>Write</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={this.readData}
                    style={styles.buttonRead}>
                    <Text style={styles.buttonText}>Read</Text>
                </TouchableOpacity>
                <View style={styles.log}>
                    <Text>{this.state.log}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('method2')}
                    style={styles.Nextbutton}>
                    <Text style={styles.buttonText}>2nd Method</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    textInput: {
        marginLeft: 20,
        marginRight: 20,
        height: 50,
        marginBottom: 10,
        textAlign: 'center',
        color: 'black'
    },
    buttonWrite: {
        marginLeft: 20,
        marginRight: 20,
        height: 50,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#9D2235'
    },
    buttonRead: {
        marginLeft: 20,
        marginRight: 20,
        height: 50,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#006C5B'
    },
    Nextbutton: {
        marginTop: 50,
        marginLeft: 20,
        marginRight: 20,
        height: 50,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: 'blue'
    },
    buttonText: {
        color: 'white'
    },
    log: {
        marginTop: 30,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
export default App;