import React from 'react';

class ChoiceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) { this.setState({ value: event.target.value }); }
  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Διαλέξτε το κριτήριο επιλογής στάσης λεωφορείου
        </label>
        <select value={this.state.value} onChange={this.handleChange}>
          <option value="proximity">
            Εγκύτητα στη τωρινή τοποθεσία μου
          </option>
          <option value="covid">
            Εκτιμώμενη ασφάλεια στον κορονοιό 
          </option>
        </select>
        <input type="submit" value="Submit" />
      </form>
    );
  }

}
export default ChoiceForm;