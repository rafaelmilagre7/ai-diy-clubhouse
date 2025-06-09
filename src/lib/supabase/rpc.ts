
import { supabase } from './client';

export const createStoragePublicPolicy = async (bucketName: string) => {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', { bucket_name: bucketName });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating storage policy:', error);
    throw error;
  }
};

export const incrementTopicViews = async (topicId: string) => {
  try {
    const { error } = await supabase.rpc('increment_topic_views', { topic_id: topicId });
    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing topic views:', error);
    throw error;
  }
};

export const incrementTopicReplies = async (topicId: string) => {
  try {
    const { error } = await supabase.rpc('increment_topic_replies', { topic_id: topicId });
    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing topic replies:', error);
    throw error;
  }
};

export const deleteForumTopic = async (topicId: string) => {
  try {
    const { error } = await supabase.rpc('deleteforumtopic', { topic_id: topicId });
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting forum topic:', error);
    throw error;
  }
};

export const deleteForumPost = async (postId: string) => {
  try {
    const { error } = await supabase.rpc('deleteforumpost', { post_id: postId });
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting forum post:', error);
    throw error;
  }
};
