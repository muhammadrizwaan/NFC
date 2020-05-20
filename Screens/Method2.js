import React, { Component } from 'react';
import {
    View,
    Text,
    Button,
    Platform,
    TouchableOpacity,
    Linking,
    TextInput,
    ScrollView,
    Alert,
    StyleSheet
} from 'react-native';
import axios from 'axios';
import NfcManager, { Ndef } from 'react-native-nfc-manager';

const RtdType = {
    URL: 0,
    TEXT: 1,
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            supported: true,
            enabled: false,
            isWriting: false,
            urlToWrite: '',
            rtdType: RtdType.URL,
            parsedText: null,
            tag: {},
            ProductDeals: [],
            Device: 'IOS',
            Message: 'Registerd tag'
        }
    }

    async UpdateStatus(Message, error) {
        await axios.get(`https://us-central1-androidapp-1e1b8.cloudfunctions.net/getUserInput?value1=${error}&value2=${Message}&deviceId=${this.state.Device}`)
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

    async componentDidMount() {

        NfcManager.isSupported()
            .then(supported => {
                this.setState({ supported });
                if (supported) {
                    this._startNfc();
                }
            })
        // try {
        //     await NfcManager.registerTagEvent();
        // } catch (ex) {
        //     NfcManager.unregisterTagEvent().catch(() => 0);
        // }
    }

    componentWillUnmount() {
        if (this._stateChangedSubscription) {
            this._stateChangedSubscription.remove();
        }
    }

    render() {
        let { supported, enabled, tag, isWriting, urlToWrite, parsedText, rtdType } = this.state;
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <TouchableOpacity
                    onPress={this._startDetection}
                    style={styles.buttonRead}>
                    <Text style={styles.buttonText}>Read</Text>
                </TouchableOpacity>

                <Text style={{ marginTop: 20 }}>{`Current tag JSON: ${JSON.stringify(tag)}`}</Text>
                {parsedText && <Text style={{ marginTop: 10, marginBottom: 20, fontSize: 18 }}>{`Parsed Text: ${parsedText}`}</Text>}


                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('method1')}
                    style={{
                        width: '95%',
                        marginTop: 50, marginLeft: 20, marginRight: 20, height: 50, marginBottom: 10, alignItems: 'center',
                        justifyContent: 'center', borderRadius: 8, backgroundColor: 'blue'
                    }}>
                    <Text style={{ color: 'white' }}>1st Method</Text>
                </TouchableOpacity>
            </View>
        )
    }





    _startNfc() {
        NfcManager.start({
            onSessionClosedIOS: () => {
                console.log('ios session closed');
            }
        })
            .then(result => {
                console.log('start OK', result);
            })
            .catch(error => {
                console.warn('start fail', error);
                this.setState({ supported: false });
            })

        if (Platform.OS === 'android') {
            this.setState({ Device: 'Android' })
            NfcManager.getLaunchTagEvent()
                .then(tag => {
                    console.log('launch tag', tag);
                    if (tag) {
                        this.setState({ tag });
                        this.UpdateStatus('launch tag', tag)
                    }
                })
                .catch(err => {
                    console.log(err);
                })
            NfcManager.isEnabled()
                .then(enabled => {
                    this.setState({ enabled });
                })
                .catch(err => {
                    console.log(err);
                })
            // NfcManager.onStateChanged(
            //     event => {
            //         if (event.state === 'on') {
            //             this.setState({ enabled: true });
            //         } else if (event.state === 'off') {
            //             this.setState({ enabled: false });
            //         } else if (event.state === 'turning_on') {
            //             // do whatever you want
            //         } else if (event.state === 'turning_off') {
            //             // do whatever you want
            //         }
            //     }
            // )
            //     .then(sub => {
            //         this._stateChangedSubscription = sub;
            //         // remember to call this._stateChangedSubscription.remove()
            //         // when you don't want to listen to this anymore
            //     })
            //     .catch(err => {
            //         console.warn(err);
            //     })
        }

    }

    _onTagDiscovered = tag => {
        console.log('Tag Discovered', tag);
        this.UpdateStatus('Tag Discovered', tag)
        this.setState({ tag });
        let text = this._parseText(tag);
        this.setState({ parsedText: text });
    }

    _startDetection = () => {
        NfcManager.registerTagEvent(this._onTagDiscovered)
            .then(result => {
                this.UpdateStatus('Response of Register TagEvent', result)
                // console.log('registerTagEvent OK', result)
            }
            )
            .catch((err) => this.UpdateStatus('Error in Register TagEvent', err))
        // .catch(error => {
        //     console.warn('registerTagEvent fail', error)
        // })
    }

    _parseText = (tag) => {
        try {
            if (Ndef.isType(tag.ndefMessage[0], Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
                return Ndef.text.decodePayload(tag.ndefMessage[0].payload);
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }
}
const styles = StyleSheet.create({
    buttonRead: {
        marginLeft: 20,
        marginRight: 20,
        height: 50,
        width: '95%',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#006C5B'
    },
    buttonText: {
        color: 'white'
    },
});
export default App;