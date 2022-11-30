const { User, Book } = require("../models");
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require("../utils/auth");
const { countDocuments } = require("../models/User");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const foundUser = await User.findOne({ _id: context.user._id })
        .select('-__v -password');
        return foundUser;
      }
      throw new AuthenticationError("You need to logged in!");
    },
  },

  Mutation: {
    addUser: async (parent, args, context) => {
      const user = await User.create(args);

      if (!user) {
        return console.error("Something is wrong!");
      }
      const token = signToken(user);
      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError ("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        return console.error("Wrong password!");
      }
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true }
        )
      }
       throw new AuthenticationError('You need to logged in!')
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updateUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        console.log(updateUser)
        return updateUser;
      }
      throw new AuthenticationError('You need to logged in!')
    },
  },
};

module.exports = resolvers;