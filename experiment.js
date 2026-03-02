
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
            stimulus: '<p><font size="3">We invite you to participate in a research study on language production and comprehension.</font></p>',
            // What should the button(s) say
            choices: ['Continue']
        };
        // push to the timeline
        timeline.push(irb)      
        
        // TODO: edit the instruction form as needed
        const instructions = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: "In this experiment, you will watch....<br>When you're ready to begin, press the space bar.",
            choices: [" "]
        };
        timeline.push(instructions);

        let tv_array = create_tv_array(trial_objects);

        // Latin Square assignment: ensures each video is paired with each label
        // equally often across participants.
        // With 3 labels and N videos, there are 3 rotations.
        // Each participant is assigned to a rotation based on their subject_id.
        const labels = ["Description A", "Description B", "Description C"];

        // Determine rotation from subject_id (hash the ID to get a stable number)
        let idSum = 0;
        for (let c = 0; c < subject_id.length; c++) {
            idSum += subject_id.charCodeAt(c);
        }
        const rotation = idSum % labels.length;

        // Assign labels using Latin Square rotation:
        // Video i gets label at index (i + rotation) % labels.length
        for (let i = 0; i < tv_array.length; i++) {
            tv_array[i].label = labels[(i + rotation) % labels.length];
        }

        // Shuffle all trials, then split into two halves
        let shuffled_tv = jsPsych.randomization.shuffle(tv_array);
        const half = Math.floor(shuffled_tv.length / 2);
        const first_half = shuffled_tv.slice(0, half);
        const second_half = shuffled_tv.slice(half);

        // Trial template shared by both halves
        const trial_template = [
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
                        label: jsPsych.timelineVariable('label')
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
        const trials_first_half = {
            timeline: trial_template,
            timeline_variables: first_half
        }
        timeline.push(trials_first_half);

        // Intervention video (no description text)
        const intervention = {
            type: jsPsychVideoKeyboardResponse,
            stimulus: ['video/intervention/video.mp4'],
            width: 640,
            height: 480,
            choices: "NO_KEYS",
            trial_ends_after_video: true,
            data: { trial_part: 'intervention' }
        };
        timeline.push(intervention);

        // Second half of trials (randomized within half via pre-shuffle)
        const trials_second_half = {
            timeline: trial_template,
            timeline_variables: second_half
        }
        timeline.push(trials_second_half);

        const save_data = {
                    type: jsPsychPipe,
                    action: "save",
                    experiment_id: "XXXXX", // TODO: replace with your experiment ID
                    filename: filename,
                    data_string: ()=>jsPsych.data.get().csv()
                };

        timeline.push(save_data);
        

        jsPsych.run(timeline)
