const { Thoughts, Users } = require('../models');
const { populate, db } = require('../models/Thought');

const thoughtsController = {
    getAllThoughts(req, res) {
        Thoughts.find({})
            .populate({ path: "reactions", select: "-__v" })
            .select('-__v')
            .then(dbThoughtData => res.json(dbThoughtData))
            .catch(err => {
                console.log(err);
                res.status(404).json(err);
            })
    },
    getThoughtsById({ params }, res) {
        Thoughts.findOne({ _id: params.id })
        .populate({ path: 'reactions', select: '-__v' })
        .select('-__v')
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id' });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => {
            console.log(err);
            res.status(404).json(err);
        });
    },
    createThoughts({ body }, res) {
        Thoughts.create(body)
        .then(dbThoughtData => {
            Users.findOneAndUpdate(
                { id: body.userId },
                { $push: { thoughts: dbThoughtData.id } },
                { new: true }
            )
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found with this id' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.status(404).json(err))
    },
    updateThoughts({ params, body }, res) {
        Thoughts.findOneAndUpdate(
            { id: params.id },
            body,
            { new: true }
        )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id' });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => res.status(404).json(err));
    },
    deleteThoughts({ params }, res) {
        Thoughts.findOneAndDelete({ id: params.id })
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id' });
                return;
            }
            Users.findOneAndUpdate(
                { username: dbThoughtData.username },
                { $pull: { thoughts: params.id } }
            )
            .then(() => {
                res.json({ message: 'Successfully deleted the thought' });
            })
            .catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json(err));
    },
    addReaction({ params, body }, res) {
        Thoughts.findOneAndUpdate(
            { id: params.thoughtId },
            { $addToSet: { reactions: body } },
            { new: true, runValidators: true }
        )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id' });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => res.status(404).json(err));
    },
    deleteReaction({ params, body }, res) {
        Thoughts.findOneAndUpdate(
            { id: params.thoughtId },
            { $pull: { reactions: { reactionId: body.reactionId } } },
            { new: true, runValidators: true }
        )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id' });
                return;
            }
            res.json({message: 'Successfully deleted the reaction'});
        })
        .catch(err => res.status(500).json(err));
    },
}

module.exports = thoughtsController;