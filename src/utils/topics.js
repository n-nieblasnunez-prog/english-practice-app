const TOPICS = {
  simple: [
    'What did you do last weekend?',
    'Describe your favorite meal.',
    'Talk about a movie or show you enjoy.',
    'What is your morning routine?',
    'Describe your hometown.',
    'What do you like to do in your free time?',
    'Talk about your best friend.',
    'What is your favorite season and why?',
    'Describe a typical day at work or school.',
    'What kind of music do you like?',
  ],
  intermediate: [
    'What are the pros and cons of social media?',
    'How has technology changed communication?',
    'Describe a challenge you overcame.',
    'What habits would you like to change and why?',
    'Talk about a place you would like to visit.',
    'How important is exercise to you?',
    'Describe your ideal job.',
    'How do you handle stress?',
    'What traditions are important in your family?',
    'How is life different in your country compared to the US?',
  ],
  advanced: [
    'What is your opinion on remote work culture?',
    'How should governments address income inequality?',
    'What role should artificial intelligence play in education?',
    'Discuss the impact of climate change on future generations.',
    'How does cultural background influence professional behavior?',
    'What are the ethical implications of genetic engineering?',
    'Should social media companies be regulated like publishers?',
    'How can cities become more sustainable?',
    'What is the relationship between language and identity?',
    'Discuss the pros and cons of globalization.',
  ],
}

export function getRandomTopic() {
  const levels = Object.keys(TOPICS)
  const level = levels[Math.floor(Math.random() * levels.length)]
  const list = TOPICS[level]
  const topic = list[Math.floor(Math.random() * list.length)]
  return { topic, level }
}

export function getTopicsByLevel(level) {
  return TOPICS[level] || []
}
