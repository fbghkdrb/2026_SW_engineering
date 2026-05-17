package com.__SW_engineering.wordtama.domain.shop.repository;

import com.__SW_engineering.wordtama.domain.shop.entity.ItemType;
import com.__SW_engineering.wordtama.domain.shop.entity.UserItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserItemRepository extends JpaRepository<UserItem, Long> {

    Optional<UserItem> findByUserIdAndItemType(Long userId, ItemType itemType);

    void deleteByUserId(Long userId);
}
