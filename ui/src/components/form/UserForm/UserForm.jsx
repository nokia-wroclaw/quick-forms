import io from 'socket.io-client';
import React, {Component} from 'react';
import {GetForm} from '../FormsHandling';
import FormStep from './FormStep';
import EndStep from './EndStep';
import {LockStep} from './LockStep';

let socketConnection;
const ENDPOINT = process.env.REACT_APP_SERVER_API_URL;

export class UserForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      formScheme: {},
      pendingFormData: {},
      formID: '',
      formDefault: '',
      filledFormNumberID: -1,
      socketResponse: '',
    };
  }
  nextStep = () => {
    const {step} = this.state;
    this.setState({
      step: step + 1,
    });
    if (step <= 3) window.localStorage.setItem('step', (step + 1).toString());
  };

  previousStep = () => {
    const {step} = this.state;
    if (step > 0) {
      this.setState({
        step: 1,
      });
      if (step >= 1) window.localStorage.setItem('step', (step - 1).toString());
    }
  };

  componentDidMount() {
    const urlData = window.location.href.split('/');
    const filledFormID = urlData[urlData.length - 1];
    console.log(filledFormID);
    if (!window.localStorage.getItem('step')) {
      window.localStorage.setItem('step', this.state.step.toString()); // necessary?
    }
    this.setState({
      step: parseInt(window.localStorage.getItem('step'), 10),
    });

    if (!window.localStorage.getItem('keyID')) {
      window.localStorage.setItem('keyID', filledFormID);
      this.setState({filledFormNumberID: filledFormID}); //is filledFormNumberID needed?
    } else {
      this.setState({filledFormNumberID: window.localStorage.getItem('keyID')});
    }

    socketConnection = io.connect(ENDPOINT);
    socketConnection.on('pendingFormID', data => {
      this.setState({socketResponse: data});
    });

    if (
      window.localStorage.getItem('data') &&
      window.localStorage.getItem('step') < 3
    ) {
      socketConnection.emit(
        `pendingFormID`,
        JSON.parse(window.localStorage.getItem('data'))
      );
    }

    const id = this.props.match.params.formID;
    this.setState({formID: id}); //needed?
    console.log('id: ' + id);
    this.LoadSchema(id).then(r => console.log(r));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.socketResponse.message === 'rejected') {
      this.setState({socketResponse: ''}, this.previousStep());
    }

    if (this.state.socketResponse.message === 'accepted')
      this.setState({socketResponse: ''}, this.nextStep());
  }

  LoadSchema = formID =>
    GetForm(formID, '/api/forms/templates/')
      .then(response => this.setState({formScheme: response.data}))
      .catch(error => console.error(`Błąd pobierania schematu: ${error}`));

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  handleSubmitSocket = async ({formData}) => {
    const pendingFormData = {
      dataForm: formData,
      templateID: this.state.formID,
      userID: this.state.formScheme.userID,
      filledFormNumberID: this.state.filledFormNumberID, // get this for localstorage?
      step: window.localStorage.getItem('step')
    };
    await this.promisedSetState({pendingFormData: pendingFormData}); // necessary to set this? get from localstorage
    window.localStorage.setItem('data', JSON.stringify(pendingFormData));
    socketConnection.emit(
      `pendingFormID`,
      JSON.parse(window.localStorage.getItem('data'))
    ); // emit on submit is fine
    console.log(this.state.pendingFormData);
  };

  render() {
    const step = parseInt(window.localStorage.getItem('step'), 10);

    const {
      formScheme,
      formID,
      formDefault,
      filledFormNumberID,
      pendingFormData,
    } = this.state;
    const values = {
      formScheme,
      formID,
      formDefault,
      filledFormNumberID,
      pendingFormData,
    };
    switch (step) {
      case 1:
        return (
          <FormStep
            handleSubmitSocket={this.handleSubmitSocket}
            nextStep={this.nextStep}
            values={values}
          />
        );
      case 2:
        return <LockStep filledFormNumberID={this.state.filledFormNumberID} />;
      case 3:
        return <EndStep />;
      default:
        return <h1>error </h1>;
    }
  }
}
export default UserForms;
