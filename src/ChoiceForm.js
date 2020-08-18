import React from 'react';

class ChoiceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preference: null,
      walkingdistance: 200,
      pathId: 1,
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
        <label>Διαλέξτε το κριτήριο επιλογής στάσης λεωφορείου</label>
        <select
          value={this.state.preference}
          name="preference"
          onChange={this.handleChange}
        >
          <option selected value={null}>
            {null}
          </option>
          <option value="proximity">Εγκύτητα στη τωρινή τοποθεσία μου</option>
          <option value="covid">Εκτιμώμενη ασφάλεια στον κορονοιό</option>
        </select>
        <br></br>
        <label>
          Επέλεξε τη μέγιστη απόσταση που προτίθεσαι να περπατήσεις (default:
          200m)
        </label>
        <input
          type="text"
          name="walkingdistance"
          placeholder="200"
          min="1"
          max="2000"
          onChange={this.handleChange}
        />
        <input type="submit" value="Submit" />
        <br />
        <label>Διάλεξε ένα pathId για να εμφανιστεί στο χάρτη</label>
        <input
          type="text"
          name="pathId"
          placeholder=""
          min="1"
          max="228"
          onChange={this.handleChange}
        />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
export default ChoiceForm;
