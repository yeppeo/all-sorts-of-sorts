import React from "react";
import "./SortingVisualiser.css";
import { performMergeSort } from "../Animation Algos/mergeSort.js";
import { performSelectionSort } from "../Animation Algos/selectionSort.js";
import { performInsertionSort } from "../Animation Algos/insertionSort.js";
import { performBubbleSort } from "../Animation Algos/bubbleSort.js";
import { Navbar, Container, Button, Form, Modal } from "react-bootstrap";
import { SortingModal } from "../Sorting Modal/SortingModal.jsx"

const stickyColour = 250;
const green = "#90EE90";
const purple = "#BD8BDD";
const red = "#FF0000"

const intervalOptions = [500, 375, 250, 100, 50, 25, 10, 5, 2, 1];

export default class SortingVisualiser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valuesToSort: [],  // Main sorting array
            timeouts: [],  // Stores all queued timeouts so we can clear them if necessary
            barNumber: 100,  // Default number of bars
            delayInterval: 9,  // Default time interval
            sortsDisabled: false,  // Should not be disabled by default
            showModal: false // Modal should not show by default
        }
    };

    componentDidMount() {  // Once we successfully render this component in, this runs
        this.resetValues();
    };

    pause() {  // Clears all queued timeouts and resets all bars to purple
        for (let i = 0; i < this.state.timeouts.length; i++) {  // Clear timeouts from our stored timeouts array
            clearTimeout(this.state.timeouts[i]);
        }
        this.state.timeouts = [];  // We reset the timeouts array to save space
        const verticalBars = document.getElementsByClassName("vertical-bar");
        for (let i = 0; i < verticalBars.length; i++) {  // Change all bars back to purple (in case we paused while they were other colours)
            verticalBars[i].style.backgroundColor = purple;
        }
    }

    resetValues() {  // Gives us a fresh randomised array
        this.pause();
        if (this.state.sortsDisabled) {
            this.enableButtons();
        }

        const newValues = [];

        let numBars = document.getElementById("num-bars").value;
        if (numBars === "") {  // If input is empty, use default value of 100
            numBars = "100";
        }

        numBars = parseInt(numBars);  // Input comes in as a string

        numBars = Math.min(100, numBars);  // 1 <= numBars <= 100
        numBars = Math.max(1, numBars);

        // TODO: If numBars outside of boundaries, replace the input with the right boundary

        for (let i = 0; i < numBars; i++) {  // Pushing random numbers between 5 and 100 (represents percentage height of bar) 
            newValues.push(Math.floor(Math.random() * (100 - 5 + 1) + 5));
        }
        this.setState({
            valuesToSort: newValues
        });
    };

    setDelayInterval() {  // Parses the input into a float to determine delay interval
        let chosenInterval = document.getElementById("delay-interval").value;
        if (chosenInterval === "") {  // If input is empty, use default value of 2
            chosenInterval = "9";
        }

        chosenInterval = parseFloat(chosenInterval)  // Input comes in as a string

        chosenInterval = Math.min(10, chosenInterval);  // 1 <= chosenInterval <= 2000
        chosenInterval = Math.max(1, chosenInterval);

        // TODO: If chosenInterval outside of boundaries, replace the input with the right boundary

        this.state.delayInterval = intervalOptions[chosenInterval - 1];
    }

    runBeforeSort() {  // Required preprocessing to clear all timeouts and check for delay interval input
        this.pause();
        this.setDelayInterval();
        // this.state.savedState = [...this.state.valuesToSort];
        // console.log("Saved state", this.state.savedState);
    }

    disableSorts(length) {  // TODO: Using bandage solution currently, fix later using setState and React disabled property
        // this.setState({sortsDisabled: true})
        // setTimeout(() => {
        //     this.setState({sortsDisabled: false})
        // }, length);
        this.disableButtons(); // Disables buttons
        setTimeout(() => {
            this.enableButtons();  // Re-enables buttons after length milliseconds
        }, length);
    }

    disableButtons() {  // Changes state and opacity / pointer-events for buttons
        this.state.sortsDisabled = true;
        let mergeSortStyle = document.getElementById("merge-sort").style;
        mergeSortStyle.opacity = .5;
        mergeSortStyle["pointer-events"] = "none";
        let selectionSortStyle = document.getElementById("selection-sort").style;
        selectionSortStyle.opacity = .5;
        selectionSortStyle["pointer-events"] = "none";
        let insertionSortStyle = document.getElementById("insertion-sort").style;
        insertionSortStyle.opacity = .5;
        insertionSortStyle["pointer-events"] = "none";
        let bubbleSortStyle = document.getElementById("bubble-sort").style;
        bubbleSortStyle.opacity = .5;
        bubbleSortStyle.pointerEvents = "none";
    }

    enableButtons() {  // Re-enables buttons and reverts all style changes
        this.state.sortsDisabled = false;
        let mergeSortStyle = document.getElementById("merge-sort").style;
        mergeSortStyle.opacity = 1;
        mergeSortStyle["pointer-events"] = "auto";
        let selectionSortStyle = document.getElementById("selection-sort").style;
        selectionSortStyle.opacity = 1;
        selectionSortStyle["pointer-events"] = "auto";
        let insertionSortStyle = document.getElementById("insertion-sort").style;
        insertionSortStyle.opacity = 1;
        insertionSortStyle["pointer-events"] = "auto";
    }

    mergeSort() {  // Performs animations for merge sort
        if (this.state.sortsDisabled) {
            return;
        }
        this.runBeforeSort();
        const [colourChanges, heightChanges] = performMergeSort(this.state.valuesToSort);
        const n = colourChanges.length;  // Should be the same for height changes

        let delayMultiplier = 0;

        const verticalBars = document.getElementsByClassName("vertical-bar");

        for (let i = 0; i < n; i++) {
            const currBars = colourChanges[i];
            const barA = verticalBars[currBars[0]].style;
            const barB = verticalBars[currBars[1]].style;

            this.state.timeouts.push(setTimeout(() => {
                barA.backgroundColor = red;
                barB.backgroundColor = red;
            }, delayMultiplier * this.state.delayInterval));
            delayMultiplier += 2;


            this.state.timeouts.push(setTimeout(() => {
                barA.backgroundColor = purple;
                barB.backgroundColor = purple;
            }, delayMultiplier * this.state.delayInterval));
            delayMultiplier += 2;

            this.state.timeouts.push(setTimeout(() => {
                const [barToChange, newBarHeight] = heightChanges[i];
                const barStyle = verticalBars[barToChange].style;
                barStyle.height = `${newBarHeight}%`;
            }, delayMultiplier * this.state.delayInterval));
            delayMultiplier += 2;
        }

        let disableSortsLength = delayMultiplier * this.state.delayInterval;
        this.disableSorts(disableSortsLength);

    };

    selectionSort() {  // Performs animations for selection sort
        if (this.state.sortsDisabled) {
            return;
        }
        this.runBeforeSort();
        const [colourChanges, heightChanges] = performSelectionSort(this.state.valuesToSort);
        const n = colourChanges.length;

        let delayMultiplier = 0;

        const verticalBars = document.getElementsByClassName("vertical-bar");

        for (let i = 0; i < n; i++) {
            const m = colourChanges[i].length;
            for (let j = 0; j < m - 1; j++) {
                const barStyle = verticalBars[colourChanges[i][j]].style;

                this.state.timeouts.push(setTimeout(() => {
                    barStyle.backgroundColor = red;
                }, delayMultiplier * this.state.delayInterval));
                delayMultiplier += 1;

                this.state.timeouts.push(setTimeout(() => {
                    barStyle.backgroundColor = purple;
                }, delayMultiplier * this.state.delayInterval));
                delayMultiplier += 1;
            }

            this.state.timeouts.push(setTimeout(() => {
                const [barA, barB, newBarAHeight, newBarBHeight] = heightChanges[i];
                const barAStyle = verticalBars[barA].style;
                barAStyle.height = `${newBarAHeight}%`;
                const barBStyle = verticalBars[barB].style; 
                barBStyle.height = `${newBarBHeight}%`;
                verticalBars[i].style.backgroundColor = green;
            }, delayMultiplier * this.state.delayInterval));
            delayMultiplier += 1;

            this.state.timeouts.push(setTimeout(() => {
                verticalBars[i].style.backgroundColor = purple;
            }, delayMultiplier * this.state.delayInterval + stickyColour));
            delayMultiplier += 1;
        }

        let disableSortsLength = delayMultiplier * this.state.delayInterval + stickyColour;
        this.disableSorts(disableSortsLength);
    };

    insertionSort() {  // Performs animations for insertion sort
        if (this.state.sortsDisabled) {
            return;
        }
        this.runBeforeSort();
        const [colourChanges, heightChanges] = performInsertionSort(this.state.valuesToSort);
        const n = colourChanges.length;

        let delayMultiplier = 0;

        const verticalBars = document.getElementsByClassName("vertical-bar");

        for (let i = 0; i < n; i++) {

            let currIterHeightChanges = heightChanges[i];
            let currIterColourChanges = colourChanges[i];

            let m = currIterHeightChanges.length;

            for (let j = 0; j < m; j++) {

                this.state.timeouts.push(setTimeout(() => {
                    const [barA, barB, newBarAHeight, newBarBHeight] = currIterHeightChanges[j];
                    const barAStyle = verticalBars[barA].style;
                    barAStyle.height = `${newBarAHeight}%`;
                    const barBStyle = verticalBars[barB].style;
                    barBStyle.height = `${newBarBHeight}%`;
                }, delayMultiplier * this.state.delayInterval));
                delayMultiplier += 1;

                let barStyle = verticalBars[currIterColourChanges[j]].style;

                if (j == m - 1) {
                    this.state.timeouts.push(setTimeout(() => {
                        barStyle.backgroundColor = green;
                    }, delayMultiplier * this.state.delayInterval));
                    delayMultiplier += 1;

                    this.state.timeouts.push(setTimeout(() => {
                        barStyle.backgroundColor = purple;
                    }, delayMultiplier * this.state.delayInterval + stickyColour));
                    delayMultiplier += 1;
                }
                else {
                    this.state.timeouts.push(setTimeout(() => {
                        barStyle.backgroundColor = red;
                    }, delayMultiplier * this.state.delayInterval));
                    delayMultiplier += 1;

                    this.state.timeouts.push(setTimeout(() => {
                        barStyle.backgroundColor = purple;
                    }, delayMultiplier * this.state.delayInterval));
                    delayMultiplier += 1;
                }

                this.state.timeouts.push(setTimeout(() => {
                    barStyle.backgroundColor = (j === m - 1) ? green : purple;
                }, delayMultiplier * this.state.delayInterval));
                delayMultiplier += 1;

                this.state.timeouts.push(setTimeout(() => {
                    barStyle.backgroundColor = purple;
                }, delayMultiplier * this.state.delayInterval + ((j === m - 1) ? stickyColour : 0)));
                delayMultiplier += 1;
            }
            
        }
        let disableSortsLength = delayMultiplier * this.state.delayInterval + stickyColour;
        this.disableSorts(disableSortsLength);
    }

    // bubbleSort() {
    //     if (this.state.sortsDisabled) {
    //         return;
    //     }
    //     this.runBeforeSort();
    //     const [colourChanges, heightChanges] = performBubbleSort(this.state.valuesToSort);
    //     const n = colourChanges.length;

    //     let delayMultiplier = 0;

    //     const verticalBars = document.getElementsByClassName("vertical-bar");

    //     let heightChangesIndex = 0;
    //     for (let i = 0; i < colourChanges.length; i++) {
    //         if (typeof(colourChanges[i]) === "number") {
    //             const [barA, barB, newBarAHeight, newBarBHeight] = heightChanges[j];

    //             let barAStyle = verticalBars[barA].style;
    //             let barBStyle = verticalBars[barB].style;
                
    //             this.state.timeouts.push(setTimeout(() => {
    //                 console.log("timeout");
    //             }));
                
    //             heightChangesIndex += 1;
    //         }
    //         else {
    //             let barAStyle = verticalBars[colourChanges[i][0]].style;
    //             let barBStyle = verticalBars[colourChanges[i][1]].style;

    //             this.state.timeouts.push(setTimeout(() => {
    //                 barAStyle.backgroundColor = red;
    //                 barBStyle.backgroundColor = red;
    //             }));
    //             delayMultiplier += 1;

    //             this.state.timeouts.push(setTimeout(() => {
    //                 barAStyle.backgroundColor = purple;
    //                 barBStyle.backgroundColor = purple;
    //             }));
    //             delayMultiplier += 1;
    //         }
    //     }
    //     console.log("count", count)
    //     console.log("height", heightChanges);
    // }

    render() {
        const values = this.state.valuesToSort;
        const numberOfBars = values.length;
        const width = Math.min(20, 80/numberOfBars);

        return (
            <div className="app-container">
                <Navbar bg="dark">
                    <div>
                        <Navbar.Brand><img className="logo" src="/logo_transparent_cropped.png" /></Navbar.Brand>
                        <Button id="learn-more" onClick={() => this.setState({showModal: true})}>Learn more about the sorting algorithms here!</Button>
                    </div>
                    <Container className="overwrite-display-flex">
                        <div>
                            <Form.Control id="num-bars" className="number-input" type="number" min="1" max="100" default-value="100" placeholder="Number of Bars" />
                            <Button id="generate-values-btn" className="sort-button" onClick={() => this.resetValues()}>Generate New Values</Button>
                        </div>
                        <div>
                            <Form.Control id="delay-interval" type="number" className="number-input" min="1" max="10" placeholder="Animation Speed" />
                            <Button id="merge-sort" className="sort-button" onClick={() => this.mergeSort()} /*disabled={this.state.sortsDisabled}*/>Merge Sort</Button>
                            <Button id="selection-sort" className="sort-button" onClick={() => this.selectionSort()} /*disabled={this.state.sortsDisabled}*/>Selection Sort</Button>
                            <Button id="insertion-sort" className="sort-button" onClick={() => this.insertionSort()} /*disabled={this.state.sortsDisabled}*/>Insertion Sort</Button>
                            {/*<Button id="bubble-sort" className="sort-button" onClick={() => this.bubbleSort()}>Bubble Sort</Button>*/}
                            {/*<Button id="pause-btn" className="sort-button" onClick={() => this.pause()}>Pause</Button>*/}
                        </div>
                    </Container>
                </Navbar>
                <div className="bar-container">
                    <Modal size="lg" show={this.state.showModal} onHide={() => this.setState({showModal: false})}>
                        <SortingModal />
                    </Modal>
                    {values.map((value, index) => 
                        <div className="vertical-bar" key={index} style={{height: `${value}%`, width: `${width}%`}} />
                    )}
                    <div className="vertical-bar invisible invisible-bar" style={{height: "100%"}} />
                </div>
            </div>
        )
    };
}

//>