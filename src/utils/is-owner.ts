


export const isOwner = (resourceAuthorId: string, userId: string): boolean => {
    return resourceAuthorId === userId;
}