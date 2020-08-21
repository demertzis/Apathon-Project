import React from 'react';

class ChoiceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preference: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    });
  }

  handleSubmit(event) {
    this.props.onClick(this.state);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>Διάλεξε το κριτήριο επιλογής στάσης λεωφορείου</label>
        <select
          value={this.state.preference}
          name="preference"
          onChange={this.handleChange}
          clss={'field-select'}
        >
          <option selected value={null}>
            {null}
          </option>
          <option value="proximity">Εγκύτητα στη τωρινή τοποθεσία μου</option>
          <option value="covid">Εκτιμώμενη ασφάλεια στον κορονοιό</option>
        </select>
        <input type="submit" value="Submit" />
        <br />
      </form>
    );
  }
}
export default ChoiceForm;
