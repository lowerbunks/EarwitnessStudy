
        const jsPsych = initJsPsych({
            show_progress_bar: true,
            on_finish: function(data) {
            window.location.href = 'finish.html';
            }
        });


        const subject_id = jsPsych.randomization.randomID(10);
        const filename = `${subject_id}.csv`;

        let timeline = [];
        
        // TODO: edit the consent form as needed
        const irb = {
            // Which plugin to use
            type: jsPsychHtmlButtonResponse,
            // What should be displayed on the screen
            stimulus: '<p><font size="3">We invite you to participate in a research study on language perception.</font></p>',
            // What should the button(s) say
            choices: ['Continue']
        };
        // push to the timeline
        timeline.push(irb)      
        
        // TODO: edit the instruction form as needed
        const instructions = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: "In this experiment, you will watch a series of videos of people discussing varying topics. After each video, there will be a brief survey. <br>When you're ready to begin, press the space bar.",
            choices: [" "]
        };
        timeline.push(instructions);

        let tv_array = create_tv_array(trial_objects);

        // Latin Square assignment: ensures each video is paired with each label
        // equally often across participants.
        // With 3 labels and N videos, there are 3 rotations.
        // Each participant is assigned to a rotation based on their subject_id.
        Benign = [
            'Benign',
            'Which Star Wars movie is the best?',
            'Who is the best basketball player of all time?',
            'Is "Die Hard" a Christmas movie?',
            'Does pineapple belong on pizza?'
        ]
        Charged = [
            'Charged',
            'Should abortion be legal?',
            'Should the death penalty be abolished?',
            'Should same-sex marriage be legal?',
            'Should gun control laws be stricter?'
        ]
        const labels = [Benign, Charged];

        // Determine rotation from subject_id (hash the ID to get a stable number)
        let idSum = 0;
        for (let c = 0; c < subject_id.length; c++) {
            idSum += subject_id.charCodeAt(c);
        }
        const rotation = idSum % labels.length;

        // Assign labels using Latin Square rotation:
        // Video i gets label at index (i + rotation) % labels.length
        // Each video receives property label_category with the category of the label
        for (let i = 0; i < tv_array.length; i++) {
            index = (i + rotation) % labels.length;
            tv_array[i].label = labels[index][Math.floor(Math.random() * 4)+1];
            tv_array[i].label_category = labels[index][0];
        }

        // Shuffle all trials
        let shuffled_tv = jsPsych.randomization.shuffle(tv_array);

        // Trial template shared by both halves
        const trial_template = [
                {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `
            The following disccussion is about the following topic: <br> 
            ${jsPsych.timelineVariable('label')}
            <br> <br> When you're ready, press the space bar.
            `,
            choices: [" "]
                },
                {
                    type: jsPsychVideoKeyboardResponse,
                    stimulus: jsPsych.timelineVariable('stimulus'),
                    width: 640,
                    height: 480,
                    choices: "NO_KEYS",
                    trial_ends_after_video: true,
                    prompt: function() {
                        let label = jsPsych.timelineVariable('label');
                        return `<p><b>${label}</b></p>`;
                    },
                    data: {
                        label: jsPsych.timelineVariable('label'),
                        label_category: jsPsych.timelineVariable('label_category')
                    }
                },
                {
                    type: jsPsychHtmlKeyboardResponse,
                    choices: [""],
                    stimulus: "",
                    response_ends_trial: false,
                    trial_duration: 1000
                }
        ];

        // First half of trials (randomized within half via pre-shuffle)
        const trials_all = {
            timeline: trial_template,
            timeline_variables: shuffled_tv
        }
        timeline.push(trials_all);

        const save_data = {
                    type: jsPsychPipe,
                    action: "save",
                    experiment_id: "1.0", // TODO: replace with your experiment ID
                    filename: filename,
                    data_string: ()=>jsPsych.data.get().csv()
                };

        timeline.push(save_data);
        

        jsPsych.run(timeline)
