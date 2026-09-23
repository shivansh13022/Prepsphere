from app.interview_graph.graph import interview_graph


# =========================================================
# INITIAL STATE
# =========================================================

initial_state = {
    "interview_id": 1,
    "difficulty": "medium",

    "core_topics": [
        "JavaScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "SQL",
    ],

    "gap_topics": [
        "TypeScript",
        "Docker",
    ],

    "current_topic": None,
    "current_question": None,
    "candidate_answer": None,

    "questions_asked": 0,
    "max_questions": 5,

    "evaluation": None,
    "end_requested": False,
}


config = {
    "configurable": {
        "thread_id": "1"
    }
}


# =========================================================
# STEP 1: START INTERVIEW
# =========================================================

result = interview_graph.invoke(
    initial_state,
    config=config,
)

print("\n===== INITIAL STATE =====")
print(initial_state)

print("\n===== QUESTION 1 STATE =====")
print(result)

print("\n===== QUESTION 1 =====")
print(result["current_question"])


# =========================================================
# STEP 2: CANDIDATE ANSWERS QUESTION 1
# =========================================================

candidate_answer = """
I would return a new Promise and iterate through all the input values.

For every value, I would use Promise.resolve so that normal values
and promises can both be handled.

I would store each resolved result at its original index.

Once all promises resolve, I would resolve the final promise
with the results array.

If any promise rejects, I would immediately reject the final promise.
"""


interview_graph.update_state(
    config,
    {
        "candidate_answer": candidate_answer
    },
)


print("\n===== ANSWER 1 ADDED =====")
print(
    interview_graph.get_state(config).values["candidate_answer"]
)


# =========================================================
# STEP 3: RESUME -> EVALUATE ANSWER 1
# =========================================================

result_after_first_evaluation = interview_graph.invoke(
    None,
    config=config,
)


print("\n===== STATE AFTER FIRST EVALUATION =====")
print(result_after_first_evaluation)


# =========================================================
# STEP 4: CHECK FOLLOW-UP QUESTION
# =========================================================

second_checkpoint = interview_graph.get_state(config)


print("\n===== QUESTION 2 =====")
print(
    second_checkpoint.values["current_question"]
)

print("\n===== QUESTIONS ASKED =====")
print(
    second_checkpoint.values["questions_asked"]
)

print("\n===== NEXT NODE =====")
print(
    second_checkpoint.next
)


# =========================================================
# STEP 5: CANDIDATE ANSWERS QUESTION 2
# =========================================================

second_answer = """
I would create a new Promise and initialize a results array
with the same length as the input.

I would also keep a completed counter starting at zero.

If the input array is empty, I would immediately resolve
with an empty array.

Then I would iterate through each input value using its index.

For every value, I would call Promise.resolve(value).

When it resolves, I would store the result at the same index
in the results array and increment the completed counter.

When completed equals the number of input values,
I would resolve the outer promise with results.

If any promise rejects, I would reject the outer promise
immediately.
"""


interview_graph.update_state(
    config,
    {
        "candidate_answer": second_answer
    },
)


print("\n===== ANSWER 2 ADDED =====")
print(
    interview_graph.get_state(config).values["candidate_answer"]
)


# =========================================================
# STEP 6: RESUME -> EVALUATE ANSWER 2
# =========================================================

result_after_second_evaluation = interview_graph.invoke(
    None,
    config=config,
)


print("\n===== STATE AFTER SECOND EVALUATION =====")
print(result_after_second_evaluation)


# =========================================================
# STEP 7: CHECK WHERE GRAPH IS NOW
# =========================================================

final_checkpoint = interview_graph.get_state(config)


print("\n===== FINAL CHECKPOINT =====")
print(final_checkpoint.values)

print("\n===== NEXT NODE AFTER SECOND EVALUATION =====")
print(final_checkpoint.next)

print("\n===== TOTAL QUESTIONS ASKED =====")
print(final_checkpoint.values["questions_asked"])