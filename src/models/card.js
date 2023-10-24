import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    // username : {
    //     type: String,
    //     validate: {
    //         validator: (username) => {
    //             const regex = /^[a-z][^\W_]{5,20}$/
    //             return (!username || !username?.trim()?.length) || regex.test(username)
    //         },
    //         message: 'Provided username is invalid.'
    //     },
    //     required: true,
    //     unique: true
    // },
    cardName: {
        type: String,
        required: true
    },
    cardPartOfSpeech: {
        type: String,
        required: true
    },
    cardDefinition: {
        type: String,
        required: true
    },
    cardSet: {
        type: String,
        required: true
    },
    cardUrl: {
        type: String,
        required: true
    },
    learnedDate: { //first access date after creation
        type: Date
    },
    staredDate: {
        type: Date
    },
    isLearned: {
        type: Boolean,
        default: false
    },
    isStared: {
        type: Boolean,
        default: false
    },
    isGamed: {
        type: Boolean,
        default: false
    },
    isListened: {
        type: Boolean,
        default: false
    },
    isTested: {
        type: Boolean,
        default: false
    },
    log: {
        type: Array,
        default: [],
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
})

const CardModel = mongoose.model("Card", cardSchema)

export { CardModel }