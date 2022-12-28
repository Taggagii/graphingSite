const plotSomeData = (data, title='Graph Title') => {
    var layout = {
        width: window.innerWidth,
        height: window.innerHeight,
        title,
    };
    
    Plotly.newPlot('graphHolder', data, layout);
};

const processData = (rows) => {
    const x = [], text = [];

    // sort the data by time
    const sortedRows = rows.sort((a, b) => a.day_time - b.day_time)

    const graphHeaders = document.getElementById('graphHeaders');
    const labelList = [...graphHeaders.querySelectorAll('label')];
    const allYs = {};
    labelList.forEach((label) => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        const {checked, name} = checkbox;
        if (checked) {
            allYs[name] = [];
        }
    });

    // clear the interface now that we've graphed
    document.getElementById('interface').innerHTML = "";

    sortedRows.forEach((row, dayCounter) => {
        x.push(dayCounter);

        Object.keys(allYs).forEach((header) => {
            allYs[header].push(row[header]);
        });

        const date = new Date(parseFloat(row.day_time));
        text.push(date.toLocaleString())
    });

    const traces = Object.keys(allYs).map((yLabel) => ({
        x,
        y: allYs[yLabel],
        text,
        type: 'scatter',
        mode: 'markers',
        name: yLabel,
    }))

    return traces;
}

const makePlot = (input) => {
    // remove any padding, scrolling, or margin on the body tag
    document.querySelector('body').style = "margin: 0; padding: 0; overflow: hidden;";

    d3.csv(input, (rows) => {
        const traces = processData(rows);
        plotSomeData(traces);
    })
};

window.onload = () => {
    const docPicker = document.getElementById('docPicker');
    const graphButton = document.getElementById('startGraphing');
    graphButton.addEventListener('click', () => {
        // use the processed data to do thing
        const fileList = docPicker.files;
        const file = fileList[fileList.length - 1];

        const fileReader = new FileReader();
        fileReader.addEventListener('load', (event) => {
            makePlot(event.target.result);
        });

        fileReader.readAsDataURL(file);

    });

    docPicker.addEventListener('change', (event) => {
        const fileList = event.target.files;
        const file = fileList[fileList.length - 1];
        
        // read data and display the headers so person can choose what to display
        const fileReader = new FileReader();
        fileReader.addEventListener('load', (event) => {
            d3.csv(event.target.result, (data) => {
                if (data.length) {
                    const headers = Object.keys(data[0]);
                    // display as a checkbox list of which headers you want to choose
                    const headersHTML = headers.map((header) => {
                        return `<label for="${header}">
                        <input type="checkbox" id="${header}" name="${header}"> ${header}
                        </label>`
                    })

                    
                    const graphHeaders = document.getElementById('graphHeaders');
                    graphHeaders.innerHTML = '<h3>Choose headers</h3>' + headersHTML.join('<br/>');
                }
            });
        })

        fileReader.readAsDataURL(file);
    });

};





