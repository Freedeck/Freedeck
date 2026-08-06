module.exports = {
	flags: ["AUTH"],
	exec: async ({ socket, data }) => {
    process.emit('SIGINT')
  }
};