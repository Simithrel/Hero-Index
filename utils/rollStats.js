export const rollStats = () => {
    const getStat = () => Math.floor(Math.random() * 76) + 25;
    return {
        Intelligence: getStat(),
        Strength: getStat(),
        Speed: getStat(),
        Durability: getStat(),
        Power: getStat(),
        Combat: getStat(),
    };
};
// used to get random stats for the roll stats function in the signup screen