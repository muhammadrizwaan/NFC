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

    async UpdateStatus(Message, error) {
        await axios.get(`https://us-central1-androidapp-1e1b8.cloudfunctions.net/getUserInput?value1=${error}&value2=${Message}&deviceId=device`)
            .then((response) => {
                console.log(response.data.result);
                if (response.data.result === "success") {
                    this.setState({ ProductDeals: response.data.result })
                }
            })
            .catch((error) => {
                Alert.alert("Please Check Your Internet Connection");
            });
    }
   
    readData = async () => {
        try {
            let tech = Platform.OS === 'ios' ? NfcTech.MifareIOS : NfcTech.NfcA;
            let resp = await NfcManager.requestTechnology(tech, {
                alertMessage: "Ready for magic"
            });
            this.UpdateStatus('(Method1)requestTechnology', resp)
            let cmd = Platform.OS === 'ios' ? NfcManager.sendMifareCommandIOS : NfcManager.transceive;
            resp = await cmd([0x3A, 4, 4])
            this.UpdateStatus('(Method1)sendMifareCommandIOS', resp)
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
                this.UpdateStatus('(Method1)text', text)
            }
            this.setState({
                log: text
            })
            console.log('state1',this.state.log)
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